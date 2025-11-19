let btnSubmit = document.getElementById("btn-submit");
const OTP_VERIFY_MESSAGE = 'OTP không chính xác. Quý khách vui lòng kiểm tra lại!';

let btnSubmitPopup = document.getElementById("btn-submit-popup");
let btnChangePhone = document.getElementById("btn-change-phone");
let isOtpFailed = false;
var myModal = new bootstrap.Modal(document.getElementById("myModal"));
var modalForm = new bootstrap.Modal(document.getElementById("modalForm"));
var modalNoti = new bootstrap.Modal(document.getElementById("modalNoti"));
var modalNotiDefault = new bootstrap.Modal(document.getElementById("modalNotiDefault"));
var modalPolicy = new bootstrap.Modal(document.getElementById("modalPolicy"));

const countdownElement = document.getElementById("countdown");
let countdownInterval;

btnSubmit.addEventListener("click", () => {
  clearInterval(countdownInterval);
  let formId = '#form-submit';
  let formData = $(formId).getValue();
  let rsValidate = this.validate(formData);
  if (!rsValidate.valid) {
    showNotiDefault('error', 'Thất bại', 'Quý khách vui lòng điền đầy đủ thông tin, vui lòng kiểm tra lại!');
    return;
  }
  if (!formData.i_agree_terms_and_conditions) {
    showNotiDefault('error', 'Thất bại', 'Quý khách vui lòng đồng ý với chính sách & điều khoản dịch vụ!');
    return;
  }
  genOtp(formId)
  startCountdown();
});

$('#btn-header-regist').click(function(event) {
  event.preventDefault()
  modalForm.show();
});

$('#btn-card_regist').click(function(event) {
    event.preventDefault()
    modalForm.show();
});

$('#card-regist_item__left').click(function(event) {
    event.preventDefault()
    modalForm.show();
});

$('#card-regist_item__right').click(function(event) {
    event.preventDefault()
    modalForm.show();
});

$('#btn-regist').click(function(event) {
    event.preventDefault()
    modalForm.show();
});


$('#btn-close-noti').click(() => {
  let classArr = $('#noti-icon-error').attr('class');
  if (classArr.indexOf('d-none') <= 0) {
    if (isOtpFailed) {
      myModal.show()
    } else {
      modalForm.show();
    }
  }
  modalNoti.hide();
})

$('#btn-close-noti-default').click(() => {
  if (isOtpFailed) {
    myModal.show()
  } 
  modalNotiDefault.hide();
})

$('#policy-info').click(() => {
  modalForm.hide();
  modalPolicy.show()
})



btnSubmitPopup.addEventListener("click", (event) => {
  event.preventDefault()
  clearInterval(countdownInterval);
  modalForm.hide();
  let formId = '#form-submit-popup';
  let formData = $(formId).getValue();
  let rsValidate = this.validate(formData);
  if (!rsValidate.valid) {
    showNoti('error', 'Thất bại', 'Quý khách vui lòng điền đầy đủ thông tin, vui lòng kiểm tra lại!');
    return;
  }
  if (!formData.i_agree_terms_and_conditions) {
    showNoti('error', 'Thất bại', 'Quý khách vui lòng đồng ý với chính sách & điều khoản dịch vụ!');
    return;
  }
  genOtp(formId)
  startCountdown();
});

async function genOtp(prevForm) {
  isOtpFailed = false;
  grecaptcha.ready(function () {
    grecaptcha
      .execute("GOOGLE_SITE_KEY_TEMP", { action: "submit" })
      .then(function (token) {
        $('#loading').show();
        let validateUrl = `${env.backEndApi}/api/lead/validate`;
        let formData = $(prevForm).getValue();
        let dataValidate = {
          request_id: uuidv4(),
          contact_number: formData.phone,
          national_id: formData.idCard
        }
        lib.post({
          url: validateUrl,
          token: token,
          data: JSON.stringify(dataValidate),
          complete: function (response) {
            $('#loading').hide();
            let dataRes = response.responseJSON;
            if (dataRes.rslt_cd === 's' && dataRes.reason_code === '0') {
              grecaptcha.ready(function () {
                grecaptcha
                  .execute("GOOGLE_SITE_KEY_TEMP", { action: "submit" })
                  .then(function (token) {
                    $('#loading').show();
                    let urlOtp = `${env.backEndApi}/api/otp/gen-otp`;
                    let formData = $(prevForm).getValue();
                    let dataOtp = {
                      TransId: uuidv4(),
                      Data: {
                        phone: formData.phone
                      }
                    }
            
                    lib.post({
                      url: urlOtp,
                      token: token,
                      data: JSON.stringify(dataOtp),
                      complete: function (response) {
                        console.log('Response otp', response)
                        let dataRes = response.responseJSON;
                        if (dataRes.data.result.status && dataRes.data.result.value) {
                          myModal.toggle();
                          $('#prev-form').val(prevForm);
                        } else {
                          if (prevForm == '#form-submit' || prevForm == '#FORM_TEXT25') {
                            showNotiDefault('error', 'Thất bại', 'Đăng ký chưa thành công, vui lòng kiểm tra lại thông tin');
                          } else {
                            showNoti('error', 'Thất bại', 'Đăng ký chưa thành công, vui lòng kiểm tra lại thông tin');
                          }
                        }
                        $('#loading').hide();
                      },
                      error: function (ex) {
                        if (prevForm == '#form-submit' || prevForm == '#FORM_TEXT25') {
                          showNotiDefault('error', 'Thất bại', 'Đăng ký chưa thành công, vui lòng kiểm tra lại thông tin');
                        } else {
                          showNoti('error', 'Thất bại', 'Đăng ký chưa thành công, vui lòng kiểm tra lại thông tin');
                        }
                        
                        $('#loading').hide();
                      },
                    });
                  });
              });
            } else {
              if (prevForm == '#form-submit' || prevForm == '#FORM_TEXT25') {
                showNotiDefault('error', 'Thất bại', 'Số điện thoại của Quý khách đã được ghi nhận tại hệ thống của chúng tôi. Chúng tôi sẽ liên hệ bạn trong thời gian sớm nhất!');
              } else {
                showNoti('error', 'Thất bại', 'Số điện thoại của Quý khách đã được ghi nhận tại hệ thống của chúng tôi. Chúng tôi sẽ liên hệ bạn trong thời gian sớm nhất!');
              }
            }
            $('#loading').hide();
          },
          error: function (ex) {
            if (prevForm == '#form-submit' || prevForm == '#FORM_TEXT25') {
              showNotiDefault('error', 'Thất bại', 'Đăng ký chưa thành công, Quý khách vui lòng kiểm tra lại thông tin');
            } else {
              showNoti('error', 'Thất bại', 'Đăng ký chưa thành công, Quý khách vui lòng kiểm tra lại thông tin');
            }
            $('#loading').hide();
          },
        });
      })});
}
function verifyOtp(otpDegit) {
  grecaptcha.ready(function () {
    grecaptcha
      .execute("GOOGLE_SITE_KEY_TEMP", { action: "submit" })
      .then(function (token) {
        $('#loading').show();
        let urlOtp = `${env.backEndApi}/api/otp/verify-otp`;
        let formId = $('#prev-form').val();
        let formData = $(formId).getValue();
        $('#prev-form').val('');
        let otpCode = `${otpDegit.code01}${otpDegit.code02}${otpDegit.code03}${otpDegit.code04}${otpDegit.code05}${otpDegit.code06}`;
        let dataOtp = {
          TransId: uuidv4(),
          Data: {
            phone: formData.phone,
            otp: otpCode
          }
        }
        lib.post({
          token: token,
          url: urlOtp,
          data: JSON.stringify(dataOtp),
          complete: function (response) {
            let dataRes = response.responseJSON;
            if (dataRes.data.result.status && dataRes.data.result.value && dataRes.data.result.authentication === 'ACCEPT') {
              grecaptcha.ready(function () {
                isOtpFailed = false;
                grecaptcha
                  .execute("GOOGLE_SITE_KEY_TEMP", { action: "submit" })
                  .then(function (token) {
                    var navigator_info = window.navigator;
                    var screen_info = window.screen;
                    var deviceId = navigator_info.mimeTypes.length;
                    deviceId += navigator_info.userAgent.replace(/\D+/g, "");
                    deviceId += navigator_info.plugins.length;
                    deviceId += screen_info.height || "";
                    deviceId += screen_info.width || "";
                    deviceId += screen_info.pixelDepth || "";

                    var urlSearchParams = new URLSearchParams(window.location.search);
                    var submitdata = urlSearchParams.get('utm_source');
                    var dataNote = {
                      cmnd: formData.idCard,
                      province: formData.livingPlace,
                      score: formData.isHaveCard,
                      isdn: formData.referencer,
                      income_amount: formData.documentType,
                      email: formData.email,
                      gender: null,
                      submitdata: submitdata,
                    };

                    let data = {
                      request_id: uuidv4(),
                      device: "01",
                      fullname: formData.name,
                      birthday: null,
                      contact_number: formData.phone,
                      note: JSON.stringify(dataNote),
                    };

                    let url = `${env.backEndApi}/api/lead/send`;
                    lib.post({
                      token: token,
                      url: url,
                      data: JSON.stringify(data),
                      complete: function (response) {
                        $('#loading').hide();
                        showNoti('success', 'Thành công', 'Cảm ơn Quý khách đã đăng ký thông tin. Chúng tôi sẽ liên hệ lại sớm nhất!');
                        hideModal();
                      },
                      error: function (ex) {
                        $('#loading').hide();
                        if (formId == '#form-submit' || formId == '#FORM_TEXT25') {
                          showNotiDefault('error', 'Thất bại', 'Đăng ký chưa thành công, vui lòng kiểm tra lại thông tin');
                        } else {
                          showNoti('error', 'Thất bại', 'Đăng ký chưa thành công, vui lòng kiểm tra lại thông tin');
                        }
                        hideModal();
                      },
                    });
                  });
              });
            } else {
              isOtpFailed = true;
              $('#loading').hide();
              if (formId == '#form-submit' || formId == '#FORM_TEXT25') {
                showNotiDefault('error', 'Thất bại', OTP_VERIFY_MESSAGE);
              } else {
                isOtpFailed = true;
                showNoti('error', 'Thất bại', OTP_VERIFY_MESSAGE);
              }
            }
          },
          error: function (ex) {
            $('#loading').hide();
            if (formId == '#form-submit' || formId == '#FORM_TEXT25') {
              showNotiDefault('error', 'Thất bại', 'Xác thực OTP chưa thành công, Quý khách vui lòng thử lại!');
            } else {
              showNoti('error', 'Thất bại', 'Xác thực OTP chưa thành công, Quý khách vui lòng thử lại!');
            }
          },
        });
      })
  });
}

btnChangePhone.addEventListener("click", () => {
  hideModal();
});

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

function hideModal() {
  clearInterval(countdownInterval);
  myModal.hide();
}

function validate(formData) {
  let rs = {
    valid: true,
    msg: "",
  };

  if(!formData.livingPlace) {
    rs.valid = false;
  }

  if(!formData.isHaveCard || formData.isHaveCard == 0) {
    rs.valid = false;
  } 

  if(!formData.name) {
    rs.valid = false;
  }

  if(!formData.documentType || formData.documentType == '') {
    rs.valid = false;
  }


  if (!formData.phone) {
    rs.valid = false;
  } else if (!lib.validatePhoneNumber(formData.phone)) {
    rs.valid = false;
  }

  return rs;
}

// === OTP
$('.otp-input').on('input', function () {
  let regexNum = /^\d+$/; 
  let valueOtp = $(this).val();
  if (!regexNum.test(valueOtp)) {
    $(this).val(null)
    return;
  } 
  if (valueOtp < 0) {
    $(this).val(null)
    return;
  }

  if (valueOtp > 9) {
    $(this).val(null)
    return;
  }
  // Move to the next input field when a digit is entered
  var maxLength = parseInt($(this).attr('maxlength'));
  var currentLength = $(this).val().length;

  if (currentLength >= maxLength) {
    // Find the next input field
    var index = $('.otp-input').index(this);
    var nextInput = $('.otp-input').eq(index + 1);

    // Focus on the next input field
    if (nextInput.length) {
      nextInput.focus();
    }
  }
  let code01 = $('#otp-01').val();
  let code02 = $('#otp-02').val();
  let code03 = $('#otp-03').val();
  let code04 = $('#otp-04').val();
  let code05 = $('#otp-05').val();
  let code06 = $('#otp-06').val();

  if (code01 && code02 && code03 && code04 && code05 && code06) {
    let otpDegit = {
      code01: code01,
      code02: code02,
      code03: code03,
      code04: code04,
      code05: code05,
      code06: code06
    }
    verifyOtp(otpDegit);
  }
});

$("#myModal").on("hidden.bs.modal", function () {
  $('#otp-01').val(null);
  $('#otp-02').val(null);
  $('#otp-03').val(null);
  $('#otp-04').val(null);
  $('#otp-05').val(null);
  $('#otp-06').val(null);
  $('#otp-01').focus();
});

function startCountdown() {
  const countdownTimeInMinutes = 10;
  const endTime = new Date().getTime() + countdownTimeInMinutes * 60 * 1000;
  function updateCountdown() {
    const currentTime = new Date().getTime();
    const timeDifference = endTime - currentTime;

    if (timeDifference > 0) {
      const minutes = Math.floor(
        (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

      if (seconds < 10) {
        countdownElement.innerHTML = `${minutes}:0${seconds}`;
      } else {
        countdownElement.innerHTML = `${minutes}:${seconds}`;
      }
    } else {
      clearInterval(countdownInterval);
      countdownElement.innerHTML = "Hết hạn nhập thông tin OTP!";
      myModal.hide();
    }
  }

  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);

}


function changeStyleDropdown(arr) {
  arr.forEach(item => {
    $(`#${item.id}`).removeAttr('style')
    $(`#${item.id}`).css(item.style)
  })
}

function showNoti(type, title, message) {
    modalNoti.show();
    $('#noti-title').text(title);
    if (type == 'success') {
      $('#noti-icon-error').addClass('d-none');
      $('#noti-icon-success').removeClass('d-none');
      $('#btn-close-noti').text('Đóng');
      
    } else {
      $('#noti-icon-success').addClass('d-none');
      $('#noti-icon-error').removeClass('d-none');
      $('#btn-close-noti').text('Quay lại');
    }
    $('#noti-message').text(message)
}

function showNotiDefault(type, title, message) {
  modalNotiDefault.show();
  $('#noti-title-default').text(title);
  if (type == 'success') {
    $('#noti-icon-error-default').addClass('d-none');
    $('#noti-icon-success-default').removeClass('d-none');
    $('#btn-close-noti-default').text('Đóng');
  } else {
    $('#noti-icon-success-default').addClass('d-none');
    $('#noti-icon-error-default').removeClass('d-none');
    $('#btn-close-noti-default').text('Quay lại');
  }
  $('#noti-message-default').text(message)
}

$("#livingPlace").change(function () {
  if($(this).val() == "") $(this).addClass("empty");
  else $(this).removeClass("empty")
});

$("#livingPlace").change();

$("#documentType").change(function () {
  if($(this).val() == "") $(this).addClass("empty");
  else $(this).removeClass("empty")
});

$("#documentType").change();
