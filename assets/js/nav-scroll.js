// 导航栏滑动条效果
document.addEventListener('DOMContentLoaded', function() {
  const navLinks = document.querySelector('.nav-links');
  const sections = document.querySelectorAll('.snap-section');
  
  // 监听滚动事件
  window.addEventListener('scroll', function() {
    let currentSection = 'intro';
    let minDistance = Infinity;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const distance = Math.abs(window.scrollY + 100 - sectionTop);
      
      if (distance < minDistance) {
        minDistance = distance;
        currentSection = section.id;
      }
    });
    
    // 找到当前页面的导航链接
    const currentLink = navLinks.querySelector(`a[href="#${currentSection}"]`);
    if (currentLink) {
      // 更新当前活动链接的样式
      navLinks.querySelectorAll('a').forEach(link => {
        link.removeAttribute('aria-current');
      });
      currentLink.setAttribute('aria-current', 'page');
      
      // 等待样式更新后再计算位置
      setTimeout(() => {
        // 计算导航栏中心位置
        const navCenter = window.innerWidth / 2;
        const linkRect = currentLink.getBoundingClientRect();
        const linkCenter = linkRect.left + linkRect.width / 2;
        
        // 计算需要移动的距离
        const moveDistance = linkCenter - navCenter;
        
        // 移动导航链接容器
        navLinks.style.transform = `translateX(-${moveDistance}px)`;
      }, 100);
    }
  });
  
  // 初始加载时设置导航栏
  const initialLink = navLinks.querySelector('a[href="#intro"]');
  if (initialLink) {
    initialLink.setAttribute('aria-current', 'page');
    
    // 等待样式更新后再计算位置
    setTimeout(() => {
      // 计算导航栏中心位置
      const navCenter = window.innerWidth / 2;
      const linkRect = initialLink.getBoundingClientRect();
      const linkCenter = linkRect.left + linkRect.width / 2;
      
      // 计算需要移动的距离
      const moveDistance = linkCenter - navCenter;
      
      // 移动导航链接容器
      navLinks.style.transform = `translateX(-${moveDistance}px)`;
    }, 100);
  }
});