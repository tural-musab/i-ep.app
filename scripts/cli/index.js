#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const ora = require('ora');
const { createTenant, listTenants, getTenant, updateTenant, deleteTenant } = require('./tenant-commands');
const { generateSchema, testConnection } = require('./db-commands');
const { version } = require('../../package.json');

// Ana program tanımlaması
program
  .name('i-ep-cli')
  .description('İ-EP.APP çok kiracılı (multi-tenant) platform yönetim aracı')
  .version(version);

// Tenant komutları
program
  .command('tenant:create')
  .description('Yeni bir tenant oluştur')
  .action(async () => {
    try {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Tenant adı:',
          validate: (input) => input.trim() !== '' ? true : 'Tenant adı boş olamaz'
        },
        {
          type: 'input',
          name: 'subdomain',
          message: 'Subdomain:',
          validate: (input) => {
            if (input.trim() === '') return 'Subdomain boş olamaz';
            if (!/^[a-z0-9-]+$/.test(input)) return 'Subdomain sadece küçük harf, rakam ve kısa çizgi içerebilir';
            return true;
          }
        },
        {
          type: 'input',
          name: 'adminEmail',
          message: 'Admin e-posta:',
          validate: (input) => {
            if (input.trim() === '') return 'Admin e-posta boş olamaz';
            if (!/^\S+@\S+\.\S+$/.test(input)) return 'Geçerli bir e-posta adresi girin';
            return true;
          }
        },
        {
          type: 'list',
          name: 'plan',
          message: 'Abonelik planı:',
          choices: ['free', 'standard', 'premium']
        }
      ]);

      const spinner = ora('Tenant oluşturuluyor...').start();
      try {
        await createTenant(answers);
        spinner.succeed(chalk.green(`"${answers.name}" tenant'ı başarıyla oluşturuldu`));
      } catch (error) {
        spinner.fail(chalk.red(`Tenant oluşturma hatası: ${error.message}`));
      }
    } catch (error) {
      console.error(chalk.red(`Hata: ${error.message}`));
    }
  });

program
  .command('tenant:list')
  .description('Tüm tenant\'ları listele')
  .option('-s, --status <status>', 'Duruma göre filtrele (active, inactive, trial)')
  .option('-l, --limit <limit>', 'Listelenecek tenant sayısı', '10')
  .action(async (options) => {
    const spinner = ora('Tenant\'lar getiriliyor...').start();
    try {
      const tenants = await listTenants(options);
      spinner.succeed(chalk.green(`${tenants.length} tenant bulundu`));
      
      if (tenants.length === 0) {
        console.log(chalk.yellow('Hiç tenant bulunamadı.'));
        return;
      }

      console.table(tenants.map(t => ({
        ID: t.id,
        Adı: t.name,
        Subdomain: t.subdomain,
        Plan: t.plan,
        Durum: t.status,
        OluşturulmaTarihi: new Date(t.createdAt).toLocaleDateString('tr-TR')
      })));
    } catch (error) {
      spinner.fail(chalk.red(`Tenant listeleme hatası: ${error.message}`));
    }
  });

program
  .command('tenant:get <tenantId>')
  .description('Belirli bir tenant hakkında detaylı bilgi')
  .action(async (tenantId) => {
    const spinner = ora(`Tenant bilgileri getiriliyor...`).start();
    try {
      const tenant = await getTenant(tenantId);
      spinner.succeed(chalk.green(`Tenant bilgileri başarıyla alındı`));
      
      console.log(chalk.bold.blue(`\n${tenant.name} (${tenant.subdomain}.i-ep.app)`));
      console.log(chalk.gray('─'.repeat(50)));
      console.log(`ID: ${chalk.cyan(tenant.id)}`);
      console.log(`Durum: ${getStatusBadge(tenant.status)}`);
      console.log(`Plan: ${chalk.cyan(tenant.plan)}`);
      console.log(`Oluşturulma Tarihi: ${chalk.cyan(new Date(tenant.createdAt).toLocaleString('tr-TR'))}`);
      
      if (tenant.customDomain) {
        console.log(`Özel Domain: ${chalk.cyan(tenant.customDomain)}`);
      }
      
      console.log(chalk.gray('─'.repeat(50)));
      console.log(chalk.bold('Özellikler:'));
      tenant.features.forEach(feature => {
        console.log(`  ${chalk.green('✓')} ${feature}`);
      });
      
      console.log(chalk.gray('─'.repeat(50)));
      console.log(chalk.bold('Tema Ayarları:'));
      console.log(`  Ana Renk: ${chalk.hex(tenant.config.theme.primaryColor)(tenant.config.theme.primaryColor)}`);
      console.log(`  İkincil Renk: ${chalk.hex(tenant.config.theme.secondaryColor)(tenant.config.theme.secondaryColor)}`);
      
      if (tenant.stats) {
        console.log(chalk.gray('─'.repeat(50)));
        console.log(chalk.bold('İstatistikler:'));
        console.log(`  Kullanıcı Sayısı: ${chalk.cyan(tenant.stats.userCount)}`);
        console.log(`  Öğrenci Sayısı: ${chalk.cyan(tenant.stats.studentCount)}`);
        console.log(`  Sınıf Sayısı: ${chalk.cyan(tenant.stats.classCount)}`);
      }
    } catch (error) {
      spinner.fail(chalk.red(`Tenant bilgisi alma hatası: ${error.message}`));
    }
  });

program
  .command('tenant:update <tenantId>')
  .description('Tenant\'ı güncelle')
  .action(async (tenantId) => {
    try {
      // Önce mevcut tenant bilgilerini al
      const spinner = ora(`Tenant bilgileri getiriliyor...`).start();
      let tenant;
      try {
        tenant = await getTenant(tenantId);
        spinner.succeed(chalk.green(`Tenant bilgileri başarıyla alındı`));
      } catch (error) {
        spinner.fail(chalk.red(`Tenant bilgisi alma hatası: ${error.message}`));
        return;
      }

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Tenant adı:',
          default: tenant.name
        },
        {
          type: 'list',
          name: 'status',
          message: 'Durum:',
          choices: ['active', 'inactive', 'trial'],
          default: tenant.status
        },
        {
          type: 'list',
          name: 'plan',
          message: 'Abonelik planı:',
          choices: ['free', 'standard', 'premium'],
          default: tenant.plan
        },
        {
          type: 'input',
          name: 'primaryColor',
          message: 'Ana renk (hex):',
          default: tenant.config.theme.primaryColor,
          validate: (input) => {
            if (!/^#[0-9A-Fa-f]{6}$/.test(input)) return 'Geçerli bir hex renk kodu girin (örn. #1a237e)';
            return true;
          }
        },
        {
          type: 'input',
          name: 'secondaryColor',
          message: 'İkincil renk (hex):',
          default: tenant.config.theme.secondaryColor,
          validate: (input) => {
            if (!/^#[0-9A-Fa-f]{6}$/.test(input)) return 'Geçerli bir hex renk kodu girin (örn. #0288d1)';
            return true;
          }
        },
        {
          type: 'checkbox',
          name: 'features',
          message: 'Özellikler:',
          choices: [
            'student_management',
            'teacher_management',
            'class_management',
            'attendance_tracking',
            'grade_management',
            'communication_module',
            'reporting'
          ],
          default: tenant.features
        }
      ]);

      // Güncelleme verilerini hazırla
      const updateData = {
        name: answers.name,
        status: answers.status,
        plan: answers.plan,
        config: {
          theme: {
            primaryColor: answers.primaryColor,
            secondaryColor: answers.secondaryColor
          }
        },
        features: answers.features
      };

      const updateSpinner = ora('Tenant güncelleniyor...').start();
      try {
        await updateTenant(tenantId, updateData);
        updateSpinner.succeed(chalk.green(`"${answers.name}" tenant'ı başarıyla güncellendi`));
      } catch (error) {
        updateSpinner.fail(chalk.red(`Tenant güncelleme hatası: ${error.message}`));
      }
    } catch (error) {
      console.error(chalk.red(`Hata: ${error.message}`));
    }
  });

program
  .command('tenant:delete <tenantId>')
  .description('Tenant\'ı sil')
  .action(async (tenantId) => {
    try {
      // Önce tenant bilgilerini al
      const spinner = ora(`Tenant bilgileri getiriliyor...`).start();
      let tenant;
      try {
        tenant = await getTenant(tenantId);
        spinner.succeed(chalk.green(`Tenant bilgileri başarıyla alındı`));
      } catch (error) {
        spinner.fail(chalk.red(`Tenant bilgisi alma hatası: ${error.message}`));
        return;
      }

      console.log(chalk.red.bold(`\nDİKKAT: "${tenant.name}" tenant'ını silmek üzeresiniz.`));
      console.log(chalk.red('Bu işlem geri alınamaz ve tüm tenant verileri kaybolacaktır!'));

      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Bu tenant\'ı silmek istediğinizden emin misiniz?',
          default: false
        }
      ]);

      if (!confirm) {
        console.log(chalk.yellow('İşlem iptal edildi.'));
        return;
      }

      const deleteSpinner = ora('Tenant siliniyor...').start();
      try {
        await deleteTenant(tenantId);
        deleteSpinner.succeed(chalk.green(`"${tenant.name}" tenant'ı başarıyla silindi`));
      } catch (error) {
        deleteSpinner.fail(chalk.red(`Tenant silme hatası: ${error.message}`));
      }
    } catch (error) {
      console.error(chalk.red(`Hata: ${error.message}`));
    }
  });

// Veritabanı komutları
program
  .command('db:schema-generate <tenantId>')
  .description('Tenant için veritabanı şeması oluştur')
  .action(async (tenantId) => {
    const spinner = ora('Veritabanı şeması oluşturuluyor...').start();
    try {
      await generateSchema(tenantId);
      spinner.succeed(chalk.green(`Veritabanı şeması başarıyla oluşturuldu`));
    } catch (error) {
      spinner.fail(chalk.red(`Şema oluşturma hatası: ${error.message}`));
    }
  });

program
  .command('db:test-connection')
  .description('Veritabanı bağlantısını test et')
  .action(async () => {
    const spinner = ora('Veritabanı bağlantısı test ediliyor...').start();
    try {
      const result = await testConnection();
      spinner.succeed(chalk.green(`Veritabanı bağlantısı başarılı: ${result.message}`));
    } catch (error) {
      spinner.fail(chalk.red(`Veritabanı bağlantı hatası: ${error.message}`));
    }
  });

// Yardımcı fonksiyonlar
function getStatusBadge(status) {
  switch (status) {
    case 'active':
      return chalk.green.bold('● Aktif');
    case 'inactive':
      return chalk.red.bold('● Pasif');
    case 'trial':
      return chalk.yellow.bold('● Deneme');
    default:
      return chalk.gray.bold(`● ${status}`);
  }
}

// Programı çalıştır
program.parse(process.argv); 