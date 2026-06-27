

// function updateQuantity(event) {
//   event.preventDefault();
//   const form = event.target;
//   const formData = new FormData(form);

//   fetch(form.action, {
//       method: form.method,
//       body: formData,
//       headers: {
//           'CSRF-Token': form._csrf.value
//       }
//   })
//   .then(response => {
//       // İstek başarılı olduğunda yapılacak işlemler
//   })
//   .catch(error => {
//       console.log(error);
//   });
// }

// document.querySelector('#userForm').addEventListener('submit', function(e) {
//   const phoneInput = document.querySelector('input[name="phone"]');
//   const phoneValue = phoneInput.value.trim();
  
//   // Başında 0 olup olmadığını kontrol et
//   if (phoneValue.startsWith('0')) {
//       e.preventDefault(); // Formun gönderilmesini engelle
//       alert('Lütfen telefon numarasını başında 0 olmadan giriniz.');
//   } else if (!/^\d{10}$/.test(phoneValue)) {
//       e.preventDefault(); // Formun gönderilmesini engelle
//       alert('Lütfen geçerli bir 10 haneli telefon numarası giriniz.');
//   }
// });



document.addEventListener('DOMContentLoaded', function () {
    const favoriteButton = document.querySelector('#favoriteButton');
    
    favoriteButton.addEventListener('click', function () {
        if (favoriteButton.classList.contains('favorite')) {
            // Kullanıcı ürünü favorilere eklemiş, buton rengini değiştir
            favoriteButton.classList.remove('favorite');
            favoriteButton.setAttribute('data-is-favorite', 'false');

            // Burada favori ürünler dizisinden bu ürünü çıkarabilirsiniz
        } else {
            // Kullanıcı ürünü favorilere eklememiş, buton rengini değiştir
            favoriteButton.classList.add('favorite');
            favoriteButton.setAttribute('data-is-favorite', 'true');

            // Burada favori ürünler dizisine bu ürünü ekleyebilirsiniz
        }
    });
});
