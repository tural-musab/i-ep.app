export default function ComponentsDocsPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">UI Bileşenleri</h1>
      
      <p className="text-lg mb-8">
        Bu bölümde, Iqra Eğitim Portalı SaaS projesinde kullanılan UI bileşenlerinin 
        dokümantasyonunu bulabilirsiniz. Bu bileşenler, tutarlı bir kullanıcı deneyimi 
        sağlamak ve geliştirme sürecini hızlandırmak için tasarlanmıştır.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Button Bileşeni */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Button</h2>
          <p className="text-gray-600 mb-4">
            Çeşitli boyut ve stillerde düğme bileşeni.
          </p>
          
          <div className="mt-4 space-y-2">
            <h3 className="text-xl font-medium">Örnekler</h3>
            <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-md">
              <button className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-600">
                Birincil
              </button>
              <button className="px-4 py-2 bg-secondary text-white rounded hover:bg-secondary-600">
                İkincil
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100">
                Nötr
              </button>
              <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                Tehlikeli
              </button>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-xl font-medium">Kullanım</h3>
            <pre className="bg-gray-100 p-3 mt-2 rounded overflow-x-auto">
              {`<Button variant="primary">Birincil</Button>
<Button variant="secondary">İkincil</Button>
<Button variant="outline">Nötr</Button>
<Button variant="destructive">Tehlikeli</Button>`}
            </pre>
          </div>
        </div>
        
        {/* Card Bileşeni */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Card</h2>
          <p className="text-gray-600 mb-4">
            İçeriği görsel olarak gruplamak için kullanılan kart bileşeni.
          </p>
          
          <div className="mt-4 space-y-2">
            <h3 className="text-xl font-medium">Örnekler</h3>
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <h3 className="font-semibold text-lg">Kart Başlığı</h3>
                <p className="text-gray-600 mt-2">Kart içeriği burada yer alır. Bu alan, kısa açıklamalar veya bilgiler içerebilir.</p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button className="px-4 py-1.5 bg-primary text-white text-sm rounded">
                    Detaylar
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-xl font-medium">Kullanım</h3>
            <pre className="bg-gray-100 p-3 mt-2 rounded overflow-x-auto">
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
          Daha fazla bileşen ve ayrıntılı kullanım kılavuzları yakında eklenecektir. 
          Katkıda bulunmak veya önerilerde bulunmak için GitHub repomuzu ziyaret edebilirsiniz.
        </p>
      </div>
    </div>
  );
} 