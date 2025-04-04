// // 统一高光处理函数
let highlightObserver = null;
// 统一高光处理函数
function initStaticHighlight() {
  const selectors = [
    '.logoPlus',
    '.v-means',
    '.v-about-video',
    '.likes ul li',
    '.v-columns-bottom ul li div',
    '.all-columns'
  ];
  // 事件处理函数工厂
  // 使用事件委托处理静态元素
  document.addEventListener('mousemove', function (e) {
    selectors.forEach(selector => {
      const element = e.target.closest(selector);
      if (element) {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        element.style.setProperty('--x', `${x}px`);
        element.style.setProperty('--y', `${y}px`);
      }
    });
  });
  document.addEventListener('mouseleave', function (e) {
    selectors.forEach(selector => {
      const element = e.target.closest(selector);
      if (element) {
        element.style.setProperty('--x', '-100px');
        element.style.setProperty('--y', '-100px');
      }
    });
  }, true);
}
// 修改后的setupDynamicHighlight
function setupDynamicHighlight() {
  if (highlightObserver) highlightObserver.disconnect();

  highlightObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        // 自动处理所有动态添加的高光元素
        const dynamicSelectors = [
          '.likes ul li',
          '.v-columns-bottom ul li div',
          '.v-about-video'
        ];

        dynamicSelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(element => {
            if (!element.dataset.glowProcessed) {
              // 添加必要样式
              element.style.position = 'relative';
              // element.style.overflow = 'hidden';
              element.dataset.glowProcessed = true;
            }
          });
        });
      }
    });
  });

  const contentContainer = document.querySelector('.content-container');
  if (contentContainer) {
    highlightObserver.observe(contentContainer, {
      childList: true,
      subtree: true
    });
  }
}

function initHighlight() {
  initStaticHighlight();
  setupDynamicHighlight();
}
//
document.addEventListener('DOMContentLoaded', () => {
  initHighlight(); // 添加这行初始化
  loadComments('new');
});


function handleContentSwitch(newContent) {
  // 清理旧内容前取消监听
  if (highlightObserver) {
    highlightObserver.disconnect();
  }

  // 更新内容容器
  const contentContainer = document.querySelector('.content-container');
  if (contentContainer) {
    contentContainer.innerHTML = newContent;
    if (contentContainer.innerHTML.includes('v-columns-bottom')) {
      const vColumnsBottomUl = document.querySelector('.v-columns-bottom').querySelector('ul')
      const vColumnsBottomLis = document.querySelector('.v-columns-bottom').querySelectorAll('li')
      vColumnsBottomUl.onmousemove = e => {
        for (const vColumnsBottomLi of vColumnsBottomLis) {
          const rect = vColumnsBottomLi.getBoundingClientRect()
          const x = e.clientX - rect.left - rect.width / 2
          const y = e.clientY - rect.top - rect.height / 2
          vColumnsBottomLi.style.setProperty('--x', `${x}px`)
          vColumnsBottomLi.style.setProperty('--y', `${y}px`)
        }
      }
    }
    //    
    // 下一事件循环重新初始化
    setTimeout(() => {
      initHighlight();
      initHoverEffect(); // 如果有其他效果需要初始化
    }, 0);
  }
}




// 在初始化时加载评论
document.addEventListener('DOMContentLoaded', () => {
  loadComments('new');
});
// 在评论分类切换时
document.addEventListener('click', function (e) {
  if (e.target.closest('.hot-c, .new-c')) {
    loadComments(e.target.classList.contains('hot-c') ? 'hot' : 'new');
  }
});
const sendComment = document.querySelector('.send-comment')
const discussInput = document.querySelector('.discuss input')
const commentBtn = document.querySelector('.comment-btn')
const cancelBtn = document.querySelector('.cancel') // 提前获取取消按钮
const btnSend = document.querySelector('.btn-send')
const comments = document.querySelector('.comments ul')
// 统一管理状态
let isExpanded = false

// 点击发送区域
if (sendComment) {
  sendComment.addEventListener('click', function () {
    if (!isExpanded) {
      sendComment.style.height = '200px'
      discussInput.style.height = '130px'
      commentBtn.style.display = 'flex'
      //让input输入聚焦位置在左上角
      discussInput.style.lineHight = '10px'

      isExpanded = true; discussInput.focus()
    }
  })
}


// 取消按钮点击 (提前绑定)
if (cancelBtn) {
  cancelBtn.addEventListener('click', function (e) {
    e.stopPropagation() // 阻止事件冒泡
    sendComment.style.height = '70px'
    discussInput.style.height = '40px'
    commentBtn.style.display = 'none'
    isExpanded = false
  })
}


// 点击文档其他区域收起
if (sendComment) {
  document.addEventListener('click', function (e) {
    if (!sendComment.contains(e.target)) {
      sendComment.style.height = '70px'
      discussInput.style.height = '40px'
      commentBtn.style.display = 'none'
      isExpanded = false
    }
  })
}
// 状态管理对象
const commentState = {
  isReplying: false, // 新增回复状态标识
  currentParent: null // 当前回复的父评论
}
function btnClick() {
  // e.preventDefault();
  // e.preventDefault();
  const content = discussInput.value.trim();
  if (!content) return;
  discussInput.style.height = '40px'
  const newComment = {
    id: commentsData.nextId++,
    author: commentState.isReplying ? '用户' : '皓',
    content: content,
    timestamp: Date.now(),
    likes: 0,
    replies: []
  };

  if (commentState.isReplying) {
    const parentComment = commentsData.new.find(c => c.id === commentState.currentParent.dataset.commentId);
    if (parentComment) {
      parentComment.replies.push(newComment);
    }
  } else {
    commentsData.new.unshift(newComment);
    commentsData.hot.unshift({ ...newComment });
  }

  saveComments();
  loadComments(document.querySelector('.comment-class .active3')?.classList.contains('hot-c') ? 'hot' : 'new');

  // 重置界面
  discussInput.value = '';
  sendComment.style.height = '70px';
  commentBtn.style.display = 'none';
  commentState.isReplying = false;
  commentState.currentParent = null;
}
// 统一发送处理函数（整合主评论和回复）
// 修改后的提交处理函数
function handleCommentSubmit() {
  document.addEventListener('click', function (e) {
    const sendBtn = e.target.closest('.btn-send');
    if (!sendBtn) return;

    e.preventDefault();
    const content = discussInput.value.trim();
    if (!content) return;
    discussInput.style.height = '40px'
    const newComment = {
      id: commentsData.nextId++,
      author: commentState.isReplying ? '用户' : '皓',
      content: content,
      timestamp: Date.now(),
      likes: 0,
      replies: []
    };

    if (commentState.isReplying) {
      const parentComment = commentsData.new.find(c => c.id === commentState.currentParent.dataset.commentId);
      if (parentComment) {
        parentComment.replies.push(newComment);
      }
    } else {
      commentsData.new.unshift(newComment);
      commentsData.hot.unshift({ ...newComment });
    }

    saveComments();
    loadComments(document.querySelector('.comment-class .active3')?.classList.contains('hot-c') ? 'hot' : 'new');

    // 重置界面
    discussInput.value = '';
    sendComment.style.height = '70px';
    commentBtn.style.display = 'none';
    commentState.isReplying = false;
    commentState.currentParent = null;
  });
  discussInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      btnClick();
    }
  });
}



// 创建评论元素的公共方法
const COMMENT_STORAGE_KEY = 'video_comments';

// 评论数据结构
let commentsData = JSON.parse(localStorage.getItem(COMMENT_STORAGE_KEY)) || {
  hot: [],
  new: [],
  nextId: 1
};

// 保存评论数据
function saveComments() {
  localStorage.setItem(COMMENT_STORAGE_KEY, JSON.stringify(commentsData));
}

// 创建评论元素的公共方法（改造后）
function createCommentElement(comment, isReply = false) {
  const element = document.createElement('li');
  element.dataset.commentId = comment.id;
  element.className = isReply ? 'hold-comments' : 'comment';
  element.innerHTML = `
    <div class="headshot"></div>
    <div class="uname">${comment.author}</div>
    <div class="c-content">${comment.content}</div>
  <div class="c-time">${new Date().toLocaleDateString()}</div>
    <div class="c-location">广东</div>
    <div class="reply">回复</div>
    <div class="love iconfont icon-shoucang1"><span>${comment.likes}</span></div>
    <div class="unlike iconfont icon-chaping"></div>
    <div class="c-more iconfont icon-gengduo"></div>
    ${!isReply ? `<div class="unhold-comments">
      展开${comment.replies.length}条评论
    </div>` : ''}
  `;
  return element;
}

// 加载评论
function loadComments(sortType = 'new') {
  const commentList = document.querySelector('.comments ul');
  if (!commentList) return;

  commentList.innerHTML = '';
  const comments = sortType === 'hot' ?
    [...commentsData.hot].sort((a, b) => b.likes - a.likes) :
    [...commentsData.new].sort((a, b) => b.timestamp - a.timestamp);

  comments.forEach(comment => {
    const commentEl = createCommentElement(comment);
    commentList.appendChild(commentEl);

    if (comment.replies.length > 0) {
      const repliesContainer = document.createElement('ul');
      comment.replies.forEach(reply => {
        repliesContainer.appendChild(createCommentElement(reply, true));
      });
      commentEl.appendChild(repliesContainer);
    }
  });
}


// 回复处理函数
function handleReply(parentComment, content) {
  let repliesContainer = parentComment.querySelector('ul');
  if (!repliesContainer) {
    repliesContainer = document.createElement('ul');
    parentComment.appendChild(repliesContainer);
  }
  const replyElement = createCommentElement(content, true);
  repliesContainer.prepend(replyElement);
}

// 初始化事件监听
document.addEventListener('click', function (e) {
  // 处理回复点击
  const replyBtn = e.target.closest('.reply');
  if (replyBtn) {
    e.preventDefault();
    e.stopPropagation();

    commentState.isReplying = true;
    commentState.currentParent = replyBtn.closest('li');
    console.log(commentState.isReplying)
    if (!isExpanded) {
      sendComment.style.height = '200px';
      discussInput.style.height = '130px';
      commentBtn.style.display = 'flex';
      isExpanded = true;
    }
  }

  // 处理取消按钮
  const cancelBtn = e.target.closest('.cancel');
  if (cancelBtn) {
    commentState.isReplying = false;
    commentState.currentParent = null;
  }
});

// 统一发送处理（替代原来的两个独立处理函数）
handleCommentSubmit();

// 统一使用事件委托处理动态元素
document.addEventListener('click', function (e) {
  const contentContainer = document.querySelector('.content-container');
  const mainR = document.querySelector('.main-r');
  const sendComment = document.querySelector('.send-comment');
  if (e.target.closest('.video-tab')) {
    contentContainer.style.height = '83%';
    let commentClass = document.querySelector('.comment-class')
    commentClass.style.display = 'none'
    const spans = document.querySelectorAll('.tab span');
    spans.forEach((span) => span.classList.remove('active'));
    e.target.classList.add('active');
    // e.target.style.fontSize = '16px';
    videoContentHTML = contentContainer.innerHTML = `<div class="vip-ad"><span>注册登录送VIP大礼包<a href=""> 立刻登录 ></a></span><span>x</span></div>
        <div class="v-name">
          <span>北上</span><span class='specific'>详情 ></span>
        </div>
        <div class="v-introduction">
          <ul>
            <li class="iconfont icon-huohua11"> 8671</li>
            <li>8.4分</li>
            <li>电视剧热播第1名</li>
            <li>励志</li>
            <li>亲情</li>
          </ul>
        </div>
        <div class="v-means">
          <div class="subscribe iconfont icon-zhuijia"> 加追</div>
          <div class="download iconfont icon-xiazai-wenjianxiazai-05"> 下载</div>
          <div class="share iconfont icon-fenxiang">分享</div>
          <div class="mores iconfont icon-gengduo">
            <div class="more">
              <div class="store">收藏</div>
              <div class="gift">送礼</div>
              <div class="report">举报</div>
            </div>

          </div>
        </div>
        <div class="open-vip">
          <img src="src=https://pic1.iqiyipic.com/lequ/common/lego/20231011/1f42a8b29a294905aaa38c8354094483.png"
            alt="">
          <div class="vip-intro1">基础会员首月特惠</div>
          <div class="vip-intro2">
            <ul>
              <li>院线新片 </li>
              <li> · 专属弹幕 </li>
              <li> · 1080p </li>
            </ul>
          </div>
          <div class="open-vip1">开通会员</div>
        </div>
        <div class="v-columns">
          <div class="v-columns-top">
            <h4>选集</h4><span>38集全</span>
            <!-- 这里整一个after -->
          </div>
          <div class="v-columns-bottom">
            <ul>
              <li><div><div class="bofang"></div>1</div></li>
              <li><div>2</div></li>
              <li><div class="iconfont icon-vip-fill">3</div></li>
              <li><div class="iconfont icon-vip-fill">4</div></li>
              <li><div class="iconfont icon-vip-fill">5</div></li>
              <li><div class="iconfont icon-vip-fill">6</div></li>
              <li><div class="iconfont icon-vip-fill">7</div></li>
              <li><div class="iconfont icon-vip-fill">8</div></li>
              <li><div class="iconfont icon-vip-fill">9</div></li>
              <li><div class="iconfont icon-vip-fill">10</div></li>
              <li><div class="iconfont icon-vip-fill">11</div></li>
              <li><div class="iconfont icon-vip-fill">12</div></li>
              <li><div class="iconfont icon-vip-fill">13</div></li>
              <li><div class="iconfont icon-vip-fill">14</div></li>
              <li><div class="iconfont icon-vip-fill">15</div></li>
            </ul>
            <div class="all-columns">查看全部(38)</div>
          </div>
        </div>
        <div class="ad">
          <img src="../img/卡提希娅.jpg" alt="">
        </div>
        <div class="v-about">
          <h4>周边视频</h4>
          <div class="v-about-tab">
            <ul>
              <li>精选</li>
              <li>官方</li>
              <li>二创</li>
              <li>解读</li>
              <li>回味</li>
            </ul>
          </div>
          <div class="v-about-videos">
            <div class="v-about-video"><img src="../img/潮.jpg"></img>
              <div class="v-about-video-info">夏日重现</div>
            </div>
            <div class="v-about-video"><img src="../img/02.jpg"></img><div class="v-about-video-info">darling</div></div>
          </div>
          <div class="all-columns">查看全部</div>
        </div>
        <div class="likes">
          猜你喜欢
          <ul>
            <li><img src="../img/椿.jpg" alt=""></li>
            <!-- 随鼠标高亮效果 -->
            <li><img src="../img/菲比竖屏壁纸.jpg" alt=""><span>菲比</span><span>光明予以赠送</span></li>
            <li><img src="../img/汐汐.png" alt=""><span>今汐</span><span>天宿庭光</span></li>
            <li><img src="../img/汐汐.png" alt=""><span>今汐</span><span>天宿庭光</span></li>
          </ul>
        </div>`;

    sendComment.style.display = 'none';
    handleContentSwitch(videoContentHTML);
  }
  if (e.target.closest('.comment-tab')) {
    contentContainer.style.height = '73%';

    const spans = document.querySelectorAll('.tab span');
    spans.forEach((span) => span.classList.remove('active'));
    e.target.classList.add('active');
    console.log(e.target)
    const commentClass = document.querySelector('.comment-class');
    commentClass.style.display = 'flex';

    // 通用切换逻辑
    if (e.target.closest('.hot-c, .new-c')) {
      // 移除所有选项的激活状态
      commentClass.querySelectorAll('.hot-c, .new-c').forEach(item => {
        item.classList.remove('active3');
      });

      // 设置当前选中状态
      e.target.classList.add('active3');

    }
    commentContentHTML = contentContainer.innerHTML = `
    <div class="ad">
      <img src="../img/卡提希娅.jpg" alt="">
    </div>
    <div class="comments">
      <ul></ul>
    </div>
  `; sendComment.style.display = 'flex';
    handleContentSwitch(commentContentHTML);
  }

  if (e.target.closest('.specific')) {
    const mainR = document.querySelector('.main-r');
    const contentContainer = document.querySelector('.content-container');

    // 创建详情页
    const mainR2 = document.createElement('div');
    mainR2.className = 'main-r2 active'; // 添加active类
    mainR2.innerHTML = `
    <div class="main-r2">
      <div class="main-r-content">
        <div class="main-r2-top">
          <span>详情</span>
          <span class="back">x</span>
        </div>
        <div class="main-r2-info">
          <div class="main-r2-info-l">
            <img src="../img/卡提.jpg" alt="">
          </div>
          <div class="main-r2-info-r">
            <div class="r2-v-name">北上</div>
            <div class="r2-v-intro">
              <span class="iconfont icon-huohua11"> 8337</span><span>励志</span><span>剧情</span><span>爱情</span>
            </div>
            <div class="v-num">38集全</div>
          </div>
        </div>
        <div class="main-r2-marks">
          <div class="mark">
            <div class="myMark">我的评分</div>
            <div class="marks">
              <span>未评分</span><span class="able-marks"><span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span></span>
            </div>
          </div>
          <div class="other-marks">
            <div class="audience">观众推荐分</div>
            <div class="r2-container">
              <div class="audience-total">
                <div class="fen">8.5</div>
                <div class="xinxin">
                  <span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span><span class="iconfont icon-star"></span>
                </div>
                <div class="num-mark">7.7万人评过</div>
              </div>
              <div class="total-marks">
                <ul>
                  <li><span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span><div class="jindukuang"><div class="jindutiao" data-id="1"></div></div></li>
                  <li><span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span><div class="jindukuang"><div class="jindutiao" data-id="2"></div></div></li>
                  <li><span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span><div class="jindukuang"><div class="jindutiao" data-id="3"></div></div></li>
                  <li><span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span><div class="jindukuang"><div class="jindutiao" data-id="4"></div></div></li>
                  <li><span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span><span class="iconfont icon-shoucang"></span><div class="jindukuang"><div class="jindutiao" data-id="5"></div></div></li>
                </ul>
              </div>
            </div>

          </div>
        </div>
        <div class="v-introduction">
          围绕几个在运河沿岸一起长大的少男少女，远离成长的运河家乡花街，时隔多年再度重聚，在历经竞争和生活的重压后，重新看到新生活希望的故事。通过这群江南少年的视角，不仅让观众目睹他们的成长轨迹，更感受到百余年来大运河从断流到新生的沧桑历史，体会博大厚重的中国运河文化在历史的长河中生生不息。
        </div>
        <div class="actors">
          <div class="actors-top">演职员</div>
          <div class="actors-list">
            <ul>
              <li>
                <img src="../img/六花.jpg" alt="">
                <div class="actor-intro">
                  <div class="actor-acname">六花</div>
                  <div class="actor">导演</div>
                </div>
              </li>
              <li>
                <img src="../img/王.jpg" alt="">
                <div class="actor-intro">
                  <div class="actor-acname">肖辰宇</div>
                  <div class="actor">演员</div>
                </div>
              </li>
              <li>
                <img src="../img/微笑汐.jpg" alt="">
                <div class="actor-intro">
                  <div class="actor-acname">今汐</div>
                  <div class="actor">演员</div>
                </div>
              </li>
              <li>
                <img src="../img/卡提害羞.jpg" alt="">
                <div class="actor-intro">
                  <div class="actor-acname">卡提希娅害羞版</div>
                  <div class="actor">演员</div>
                </div>
              </li>
              <li>
                <img src="../img/波奇.jpg" alt="">
                <div class="actor-intro">
                  <div class="actor-acname">阿尼亚</div>
                  <div class="actor">演员</div>
                </div>
              </li>
              <li>
                <img src="../img/蝶.jpg" alt="">
                <div class="actor-intro">
                  <div class="actor-acname">蝶</div>
                  <div class="actor">演员</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;

    // 插入到main-r容器最前面
    mainR.insertBefore(mainR2, mainR.firstChild);
    mainR.style.display = 'block';
    // 隐藏原内容但不移除
    contentContainer.style.display = 'none';
    document.querySelector('.send-comment').style.display = 'none';
    const backBtn = document.querySelector('.back');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        setTimeout(initHighlight, 0);
      });
    }
  }

  // 返回按钮点击
  if (e.target.closest('.back')) {
    const mainR2 = document.querySelector('.main-r2');
    if (mainR2) {
      // 滑动隐藏效果
      mainR2.classList.remove('active');
      mainR2.addEventListener('transitionend', () => {
        mainR2.remove();
        document.querySelector('.content-container').style.display = 'block';
        // document.querySelector('.send-comment').style.display = 'flex';
      }, { once: true });
    }
  }
});
document.querySelector('.content-container').innerHTML = `<div class="vip-ad"><span>注册登录送VIP大礼包<a href=""> 立刻登录 ></a></span><span>x</span></div>
        <div class="v-name">
          <span>北上</span><span class='specific'>详情 ></span>
        </div>
        <div class="v-introduction">
          <ul>
            <li class="iconfont icon-huohua11"> 8671</li>
            <li>8.4分</li>
            <li>电视剧热播第1名</li>
            <li>励志</li>
            <li>亲情</li>
          </ul>
        </div>
        <div class="v-means">
          <div class="subscribe iconfont icon-zhuijia"> 加追</div>
          <div class="download iconfont icon-xiazai-wenjianxiazai-05"> 下载</div>
          <div class="share iconfont icon-fenxiang">分享</div>
          <div class="mores iconfont icon-gengduo">
            <div class="more">
              <div class="store">收藏</div>
              <div class="gift">送礼</div>
              <div class="report">举报</div>
            </div>

          </div>
        </div>
        <div class="open-vip">
          <img src="src=https://pic1.iqiyipic.com/lequ/common/lego/20231011/1f42a8b29a294905aaa38c8354094483.png"
            alt="">
          <div class="vip-intro1">基础会员首月特惠</div>
          <div class="vip-intro2">
            <ul>
              <li>院线新片 </li>
              <li> · 专属弹幕 </li>
              <li> · 1080p </li>
            </ul>
          </div>
          <div class="open-vip1">开通会员</div>
        </div>
        <div class="v-columns">
          <div class="v-columns-top">
            <h4>选集</h4><span>38集全</span>
            <!-- 这里整一个after -->
          </div>
          <div class="v-columns-bottom">
            <ul>
              <li><div><div class="bofang"></div>1</div></li>
              <li><div>2</div></li>
              <li><div class="iconfont icon-vip-fill">3</div></li>
              <li><div class="iconfont icon-vip-fill">4</div></li>
              <li><div class="iconfont icon-vip-fill">5</div></li>
              <li><div class="iconfont icon-vip-fill">6</div></li>
              <li><div class="iconfont icon-vip-fill">7</div></li>
              <li><div class="iconfont icon-vip-fill">8</div></li>
              <li><div class="iconfont icon-vip-fill">9</div></li>
              <li><div class="iconfont icon-vip-fill">10</div></li>
              <li><div class="iconfont icon-vip-fill">11</div></li>
              <li><div class="iconfont icon-vip-fill">12</div></li>
              <li><div class="iconfont icon-vip-fill">13</div></li>
              <li><div class="iconfont icon-vip-fill">14</div></li>
              <li><div class="iconfont icon-vip-fill">15</div></li>
            </ul>
            <div class="all-columns">查看全部(38)</div>
          </div>
        </div>
        <div class="ad">
          <img src="../img/卡提希娅.jpg" alt="">
        </div>
        <div class="v-about">
          <h4>周边视频</h4>
          <div class="v-about-tab">
            <ul>
              <li>精选</li>
              <li>官方</li>
              <li>二创</li>
              <li>解读</li>
              <li>回味</li>
            </ul>
          </div>
          <div class="v-about-videos">
            <div class="v-about-video"><img src="../img/潮.jpg"></img>
              <div class="v-about-video-info">夏日重现</div>
            </div>
            <div class="v-about-video"><img src="../img/02.jpg"></img><div class="v-about-video-info">darling</div></div>
          </div>
          <div class="all-columns">查看全部</div>
        </div>
        <div class="likes">
          猜你喜欢
          <ul>
            <li><img src="../img/椿.jpg" alt=""></li>
            <!-- 随鼠标高亮效果 -->
            <li><img src="../img/菲比竖屏壁纸.jpg" alt=""><span>菲比</span><span>光明予以赠送</span></li>
            <li><img src="../img/汐汐.png" alt=""><span>今汐</span><span>天宿庭光</span></li>
            <li><img src="../img/汐汐.png" alt=""><span>今汐</span><span>天宿庭光</span></li>
          </ul>
        </div> `;


const vColumnsBottomUl = document.querySelector('.v-columns-bottom').querySelector('ul')
const vColumnsBottomLis = document.querySelector('.v-columns-bottom').querySelectorAll('li')
vColumnsBottomUl.onmousemove = e => {
  for (const vColumnsBottomLi of vColumnsBottomLis) {
    const rect = vColumnsBottomLi.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    vColumnsBottomLi.style.setProperty('--x', `${x}px`)
    vColumnsBottomLi.style.setProperty('--y', `${y}px`)
  }
}
let hideTimer2 = null
//经过holder holdertab展开
const holder = document.querySelector('.holder')
const holderTab = document.querySelector('.holder-tab')
holder.addEventListener('mouseover', function (e) {
  clearTimeout(hideTimer2)
  holderTab.style.visibility = 'visible'

})
holder.addEventListener('mouseout', function (e) {
  hideTimer2 = setTimeout(function () {
    holderTab.style.visibility = 'hidden'
  }, 10)
})
holderTab.addEventListener('mouseover', function (e) {
  clearTimeout(hideTimer2)
})
holderTab.addEventListener('mouseout', function (e) {
  holderTab.style.visibility = 'hidden'
})

// //大小屏holder-tab调整
// let isMoved = false;

// function adjustLayout() {
//   const topLTab = document.querySelector('.top-l-tab');
//   const holder = document.querySelector('.holder');
//   const holderTab = document.querySelector('.holder-tab');
//   const holderItems = document.querySelectorAll('.holderli');
//   const screenWidth = window.innerWidth;

//   // 小屏幕处理（添加断点 1200px）
//   if (screenWidth > 1200) {
//     if (!isMoved) {
//       // 将holder内容移植到导航栏
//       holderItems.forEach(item => {
//         const li = document.createElement('li');
//         li.textContent = item.textContent;
//         li.classList.add('dynamic-li'); // 添加标记类
//         topLTab.appendChild(li);
//       });
//       holder.style.display = 'none';
//       holderTab.style.display = 'none';
//       isMoved = true;
//     }
//   }
//   // 大屏幕处理
//   else {
//     if (isMoved) {
//       // 移除动态添加的项
//       const dynamicItems = topLTab.querySelectorAll('.dynamic-li');
//       dynamicItems.forEach(item => item.remove());
//       holder.style.display = 'block';
//       holderTab.style.display = 'block';
//       isMoved = false;
//     }
//   }
// }

// // 初始化执行 + 监听窗口变化
// window.addEventListener('resize', adjustLayout);
// adjustLayout();const loginIntroduction = document.querySelector('.loginIntroduction')
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
  let newHeight2;
  let newHeight3;
  // 根据不同的缩放比例设置高度
  if (scale >= 1.95 && scale <= 2.05) {
    newHeight = 1900;
    newHeight2 = 69;
    newHeight3 = 66;
  } else if (scale >= 1.49 && scale <= 1.95) {
    newHeight = 1600;
    newHeight2 = 61;
    newHeight3 = 57;

  } else if (scale >= 1.33 && scale <= 1.49) {
    newHeight = 1450;
    newHeight2 = 59;
    newHeight3 = 55;

  } else if (scale >= 1.24 && scale <= 1.32) {
    newHeight = 1400;
    newHeight2 = 58;
    newHeight3 = 53;

  }
  else if (scale >= 1.1 && scale <= 1.23) {
    newHeight = 1330;
    newHeight2 = 55;
    newHeight3 = 49;

  }
  else if (scale >= 0.99 && scale <= 1.0) {
    newHeight = 1260;
    newHeight2 = 50;
    newHeight3 = 45;

  }

  else {

    newHeight = 1450;
    newHeight2 = 39;
    newHeight3 = 65;


  }


  const main = document.querySelector('.main');
  const videobox = document.querySelector('.videobox')
  const contentContainer = document.querySelector('.content-container');
  if (main) {
    main.style.height = `${newHeight}px`;
    // console.log(`Video cards height adjusted to ${newHeight}px`)
  } else {
    console.warn('Video cards element not found');
  }
  if (videobox) {
    videobox.style.height = `${newHeight2}%`;
    // console.log(`Video cards height adjusted to ${newHeight}%`)
  } else {
    console.warn('Video cards element not found');
  }
  if (contentContainer) {
    contentContainer.style.height = `${newHeight3}%`;
    console.log(`Video cards height adjusted to ${newHeight3}%`)
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


let hideTimer0 = null
//经过login显示
login.addEventListener('mouseenter', function () {
  clearTimeout(hideTimer0)
  loginIntroduction.style.visibility = 'visible'
})

// 离开login按钮
login.addEventListener('mouseleave', function (e) {
  hideTimer0 = setTimeout(() => {
    loginIntroduction.style.visibility = 'hidden'
  }, 300)
})

// 进入loginIntroduction
loginIntroduction.addEventListener('mouseenter', function () {
  clearTimeout(hideTimer0) // 取消隐藏
})

// 离开loginIntroduction
loginIntroduction.addEventListener('mouseleave', function () {
  loginIntroduction.style.visibility = 'hidden'
})
// 初始化执行
adjustVideoCardsHeight();