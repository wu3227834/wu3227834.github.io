// 原生轻量图片灯箱，替代 fancybox（无 jQuery 依赖）
!function () {
    var overlay = null
    var currentImg = null

    function createOverlay() {
        overlay = document.createElement('div')
        overlay.className = 'lightbox-overlay'

        var img = document.createElement('img')
        img.className = 'lightbox-img'
        overlay.appendChild(img)
        currentImg = img

        var hint = document.createElement('span')
        hint.className = 'lightbox-hint'
        hint.textContent = '点击任意处关闭'
        overlay.appendChild(hint)

        overlay.addEventListener('click', close)
        document.body.appendChild(overlay)
    }

    function open(src, alt) {
        if (!overlay) createOverlay()
        currentImg.src = src
        currentImg.alt = alt || ''
        overlay.classList.add('is-visible')
        document.body.style.overflow = 'hidden'
    }

    function close() {
        if (!overlay) return
        overlay.classList.remove('is-visible')
        document.body.style.overflow = ''
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close()
    })

    // 事件委托：内容区的图片点击放大
    var container = document.querySelector('.post-content') || document.querySelector('.index-middle')
    if (container) {
        container.addEventListener('click', function (e) {
            var target = e.target
            if (target.tagName === 'IMG' && !target.closest('.donate-container')) {
                e.preventDefault()
                open(target.src, target.alt)
            }
        })
    }
}()
