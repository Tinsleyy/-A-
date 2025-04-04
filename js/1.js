const loginIntroduction = document.querySelector('.loginIntroduction')
const login = document.querySelector('.login')
const top1 = document.querySelector('.top')
const videoCards = document.querySelector('.video-cards')
const loginCab = document.querySelector('.loginCab')
const overlay = document.querySelector('.overlay')
let hideTimer = null
//经过login显示
login.addEventListener('mouseenter', function () {
  clearTimeout(hideTimer)
  loginIntroduction.style.visibility = 'visible'
})

// 离开login按钮
login.addEventListener('mouseleave', function (e) {
  hideTimer = setTimeout(() => {
    loginIntroduction.style.visibility = 'hidden'
  }, 300)
})

// 进入loginIntroduction
loginIntroduction.addEventListener('mouseenter', function () {
  clearTimeout(hideTimer) // 取消隐藏
})

// 离开loginIntroduction
loginIntroduction.addEventListener('mouseleave', function () {
  loginIntroduction.style.visibility = 'hidden'
})
//当滚动到离video-cards10px收 top背景色变深
window.addEventListener('scroll', function () {
  if (window.scrollY >= videoCards.offsetTop - 20) {
    top1.style.backgroundColor = '#1f2123'
  } else {
    top1.style.backgroundColor = 'transparent'
  }
})
// 点击login按钮 显示登录框
login.addEventListener('click', function () {
  loginCab.style.display = 'flex'
  overlay.style.display = 'block';
})

//点击不同的登录方式切换不同的登录框 同时给该登录方式添加active类
const loginMethod = document.querySelector('.loginMethod')
const spans = loginMethod.querySelectorAll('span') // 获取所有 span 元素
const loginCabRTabContent = document.querySelector('.loginCabR-tabContent')
loginMethod.addEventListener('click', (e) => {
  if (e.target.tagName === 'SPAN') {
    // 先移除所有 span 的 active 类
    spans.forEach(span => span.classList.remove('active'))
    // 再给点击的 span 添加 active
    e.target.classList.add('active')
  }
  loginCabRTabContent.innerHTML = ``
  // 根据点击的 span 的 data-id 属性值，显示对应的登录框
  const id = e.target.dataset.id
  if (id === '1') {

    loginCabRTabContent.innerHTML = `<img src="../img/二维码.png" alt="">
        <div class="phoneiQIYI">打开<a href="">爱奇艺手机APP</a>扫码登录</div>`
  }
  else if (id === '3') {
    //给loginCabRTabContent设置名字
    loginCabRTabContent.className = 'loginCabR-tabContent loginCabRTabContent'
    loginCabRTabContent.innerHTML = `<input type="text" name="" id="" placeholder="请输入手机号/邮箱">
      <input type="password" name="" id="" placeholder="请输入密码">

      <div class="forget">忘记密码</div>
      <div class="loginCabR-bottom3">登录</div>`
    const shouPassword = document.querySelector('.shouPassword')
    const input = document.querySelector('.loginCabR-tabContent input[type="password"]')
    shouPassword.addEventListener('click', function () {
      if (input.type === 'password') {
        input.type = 'text'
        shouPassword.innerHTML = '隐'
      } else {
        input.type = 'password'
        shouPassword.innerHTML = '显'
      }
    })
  }

})
//点击登录框的叉号 关闭登录框
const loginCabRCancel = document.querySelector('.loginCabR-cancel')
loginCabRCancel.addEventListener('click', function () {
  loginCab.style.display = 'none'
  overlay.style.display = 'none'
})


function adjustVideoCardsHeight() {
  // 获取视口和窗口的实际尺寸
  const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const windowWidth = window.outerWidth;

  // 计算缩放比例（保留两位小数）
  const scale = Number((viewportWidth / windowWidth).toFixed(2));
  console.log(scale);
  let newHeight;

  // 根据不同的缩放比例设置高度
  if (scale >= 1.95 && scale <= 2.05) {     // 100% 缩放（允许 ±5% 误差）
    newHeight = 1900;
  } else if (scale >= 1.49 && scale <= 1.95) { // 50% 缩放
    newHeight = 1600;
  } else if (scale >= 1.33 && scale <= 0.49) { // 75% 缩放90% 缩放
    newHeight = 1450;
  } else if (scale >= 1.24 && scale <= 1.32) { // 80% 缩放
    newHeight = 1400;
  }
  else if (scale >= 1.1 && scale <= 1.23) { // 80% 缩放
    newHeight = 1330;
  }
  else if (scale >= 0.99 && scale <= 1.0) { // 80% 缩放
    newHeight = 1260;
  }

  else {
    // 默认情况：线性插值或固定值
    newHeight = 1450; // 或者根据需求计算动态值
  }

  // 确保 videoCards 元素存在
  const videoCards = document.querySelector('.video-cards');
  if (videoCards) {
    videoCards.style.height = `${newHeight}px`;
  } else {
    console.warn('Video cards element not found');
  }
}

// 使用防抖函数优化 resize 监听
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(adjustVideoCardsHeight, 250);
});

// 初始化执行
adjustVideoCardsHeight();