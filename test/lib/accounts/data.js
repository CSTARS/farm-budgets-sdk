module.exports = function() {
  return {

  u1 : {
    "iss": "https://identitytoolkit.google.com/",
    "aud": "some-crazy-url.com",
    "iat": 1452883013,
    "exp": 1454092613,
    "user_id": "1234",
    "email": "tester@farmbudgets.org",
    "provider_id": "farmbudgets.org",
    "verified": true,
    "display_name": "Tester",
    "photo_url": "http://ifaq.wap.org/posters/hal1.gif",
    "id": "0987654",
    "testing" : true,
    "authorities": [
      "API Test",
    ]
  },

  u2 : {
    "iss": "https://identitytoolkit.google.com/",
    "aud": "some-crazy-url.com",
    "iat": 1452883013,
    "exp": 1454092613,
    "user_id": "5678",
    "email": "tester2@farmbudgets.org",
    "provider_id": "farmbudgets.org",
    "verified": true,
    "display_name": "Tester 2",
    "photo_url": "http://vignette2.wikia.nocookie.net/en.futurama/images/4/43/Bender.png/revision/latest?cb=20150206072725",
    "id": "12345678",
    "testing" : true,
    "authorities": [
      "API Test",
      "API Test 2"
    ]
  },

  u3 : {
    "iss": "https://identitytoolkit.google.com/",
    "aud": "some-crazy-url.com",
    "iat": 1452883013,
    "exp": 1454092613,
    "user_id": "5678",
    "email": "admin@farmbudgets.org",
    "provider_id": "farmbudgets.org",
    "verified": true,
    "display_name": "Admin Tester",
    "photo_url": "http://vignette4.wikia.nocookie.net/sporum/images/a/aa/Pretty_pony.jpg/revision/latest?cb=20101010212252",
    "id": "12345678",
    "testing" : true,
    "admin" : true,
    "authorities": [
      "API Test"
    ]
  }

};
};
