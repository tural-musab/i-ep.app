export default function ComponentsDocsPage() {
  return (
    <div>
      <h1 className="mb-6 text-4xl font-bold">UI Bileşenleri</h1>

      <p className="mb-8 text-lg">
        Bu bölümde, Iqra Eğitim Portalı SaaS projesinde kullanılan UI bileşenlerinin
        dokümantasyonunu bulabilirsiniz. Bu bileşenler, tutarlı bir kullanıcı deneyimi sağlamak ve
        geliştirme sürecini hızlandırmak için tasarlanmıştır.
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Button Bileşeni */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-semibold">Button</h2>
          <p className="mb-4 text-gray-600">Çeşitli boyut ve stillerde düğme bileşeni.</p>

          <div className="mt-4 space-y-2">
            <h3 className="text-xl font-medium">Örnekler</h3>
            <div className="flex flex-wrap gap-2 rounded-md bg-gray-50 p-4">
              <button className="bg-primary hover:bg-primary-600 rounded px-4 py-2 text-white">
                Birincil
              </button>
              <button className="bg-secondary hover:bg-secondary-600 rounded px-4 py-2 text-white">
                İkincil
              </button>
              <button className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100">
                Nötr
              </button>
              <button className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">
                Tehlikeli
              </button>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-xl font-medium">Kullanım</h3>
            <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-3">
              {`<Button variant="primary">Birincil</Button>
<Button variant="secondary">İkincil</Button>
<Button variant="outline">Nötr</Button>
<Button variant="destructive">Tehlikeli</Button>`}
            </pre>
          </div>
        </div>

        {/* Card Bileşeni */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-semibold">Card</h2>
          <p className="mb-4 text-gray-600">
            İçeriği görsel olarak gruplamak için kullanılan kart bileşeni.
          </p>

          <div className="mt-4 space-y-2">
            <h3 className="text-xl font-medium">Örnekler</h3>
            <div className="rounded-md bg-gray-50 p-4">
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-lg font-semibold">Kart Başlığı</h3>
                <p className="mt-2 text-gray-600">
                  Kart içeriği burada yer alır. Bu alan, kısa açıklamalar veya bilgiler içerebilir.
                </p>
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <button className="bg-primary rounded px-4 py-1.5 text-sm text-white">
                    Detaylar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-xl font-medium">Kullanım</h3>
            <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-3">
              {`<Card>
  <CardHeader>
    <CardTitle>Kart Başlığı</CardTitle>
  </CardHeader>
  <CardContent>
    Kart içeriği burada yer alır.
  </CardContent>
  <CardFooter>
    <Button>Detaylar</Button>
  </CardFooter>
</Card>`}
            </pre>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-gray-600">
          Daha fazla bileşen ve ayrıntılı kullanım kılavuzları yakında eklenecektir. Katkıda
          bulunmak veya önerilerde bulunmak için GitHub repomuzu ziyaret edebilirsiniz.
        </p>
      </div>
    </div>
  );
}
