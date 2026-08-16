/**
 * Created by Xiaotao.Nie on 09/04/2018.
 * All right reserved
 * IF you have any question please email onlythen@yeah.net
 */

function escapeHTML(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;'
        }[char]
    })
}

function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlightKeyword(value, keyword) {
    var escapedValue = escapeHTML(value)
    if (!keyword) return escapedValue

    var flags = caseSensitive ? 'g' : 'ig'
    return escapedValue.replace(new RegExp('(' + escapeRegExp(escapeHTML(keyword)) + ')', flags), "<span class='red'>$1</span>")
}

// Global functions and listeners
window.onresize = function () {
    if (window.document.documentElement.clientWidth > 680) {
        var aboutContent = document.getElementById('nav-content')
        if (aboutContent) {
            aboutContent.classList.remove('hide-block')
            aboutContent.classList.remove('show-block')
        }
    }

    reHeightToc()
}

// Nav switch function on mobile
/*****************************************************************************/
var navToggle = document.getElementById('site-nav-toggle')
if (navToggle) {
    navToggle.addEventListener('click', function () {
        var aboutContent = document.getElementById('nav-content')
        if (!aboutContent) return

        if (!aboutContent.classList.contains('show-block')) {
            aboutContent.classList.add('show-block')
            aboutContent.classList.remove('hide-block')
        } else {
            aboutContent.classList.add('hide-block')
            aboutContent.classList.remove('show-block')
        }
    })
}

// Desktop sidebar collapse/expand toggle
/*****************************************************************************/
var navToggleBtn = document.getElementById('nav-toggle-btn')
var navEl = document.getElementById('nav')
if (navToggleBtn && navEl) {
    // 从 localStorage 恢复状态
    var savedNavState = localStorage.getItem('nav-collapsed')
    if (savedNavState === 'false') {
        navEl.classList.remove('is-collapsed')
        navEl.classList.add('is-expanded')
    }

    navToggleBtn.addEventListener('click', function () {
        var isCollapsed = navEl.classList.contains('is-collapsed')
        if (isCollapsed) {
            navEl.classList.remove('is-collapsed')
            navEl.classList.add('is-expanded')
            navToggleBtn.title = '收起导航'
            localStorage.setItem('nav-collapsed', 'false')
        } else {
            navEl.classList.remove('is-expanded')
            navEl.classList.add('is-collapsed')
            navToggleBtn.title = '展开导航'
            localStorage.setItem('nav-collapsed', 'true')
        }
    })
}

// global search
/*****************************************************************************/
var searchButton = document.getElementById('search')
var searchField = document.getElementById('search-field')
var searchInput = document.getElementById('search-input')
var searchResultContainer = document.getElementById('search-result-container')
var escSearch = document.getElementById('esc-search')
var bgSearch = document.getElementById('search-bg')
var beginSearch = document.getElementById('begin-search')

var searchJson
var caseSensitive = false

if (searchButton && searchField && searchInput && searchResultContainer && escSearch && bgSearch && beginSearch) {
    searchField.addEventListener('mousewheel', function (e) {
        e.stopPropagation()
        return false
    }, false)

    searchButton.addEventListener('click', function () {
        search()
    })

    escSearch.addEventListener('click', function () {
        hideSearchField()
    })

    bgSearch.addEventListener('click', function () {
        hideSearchField()
    })

    beginSearch.addEventListener('click', function () {
        var keyword = searchInput.value
        if (keyword) {
            searchFromKeyWord(keyword)
        }
    })
}

function toggleSeachField() {
    if (!searchField) return

    if (!searchField.classList.contains('show-flex-fade')) {
        showSearchField()
    } else {
        hideSearchField()
    }
}

function showSearchField() {
    if (!searchField || !searchInput) return

    searchInput.focus()
    searchField.classList.add('show-flex-fade', 'search-animation')
    searchField.classList.remove('hide-flex-fade')
}

function hideSearchField() {
    if (!searchField) return

    window.onkeydown = null
    searchField.classList.add('hide-flex-fade')
    searchField.classList.remove('show-flex-fade')
}

function searchFromKeyWord(keyword) {
    keyword = keyword || ''
    if (!searchResultContainer) return

    var result = []
    var slideWindowSize = 100
    var handleKeyword = caseSensitive ? keyword : keyword.toLowerCase()

    if (!searchJson) return -1

    searchJson.forEach(function (item) {
        if (!item.title || !item.content) return

        var title = String(item.title)
        var content = String(item.content).trim().replace(/<[^>]+>/g, '').replace(/[`#\n]/g, '')
        var lowerTitle = caseSensitive ? title : title.toLowerCase()
        var lowerContent = caseSensitive ? content : content.toLowerCase()

        if (lowerTitle.indexOf(handleKeyword) === -1 && lowerContent.indexOf(handleKeyword) === -1) return

        var resultItem = {
            title: highlightKeyword(title, keyword),
            url: item.url,
            content: []
        }

        var lastend = 0
        while (lowerContent.indexOf(handleKeyword) !== -1) {
            var keywordIndex = lowerContent.indexOf(handleKeyword)
            var begin = keywordIndex - slideWindowSize / 2 < 0 ? 0 : keywordIndex - slideWindowSize / 2
            var end = begin + slideWindowSize

            resultItem.content.push('...' + highlightKeyword(content.slice(lastend + begin, lastend + end), keyword) + '...')
            lowerContent = lowerContent.slice(end, lowerContent.length)
            lastend += end
        }

        result.push(resultItem)
    })

    if (!result.length) {
        searchResultContainer.innerHTML = '<div class="no-search-result">No Result</div>'
        return
    }

    var searchFragment = document.createElement('ul')

    result.forEach(function (item) {
        var searchItem = document.createElement('li')
        var searchTitle = document.createElement('a')
        searchTitle.href = item.url
        searchTitle.innerHTML = item.title
        searchItem.appendChild(searchTitle)

        if (item.content.length) {
            var searchContentLiContainer = document.createElement('ul')
            item.content.forEach(function (citem) {
                var searchContentFragment = document.createElement('li')
                searchContentFragment.innerHTML = citem
                searchContentLiContainer.appendChild(searchContentFragment)
            })
            searchItem.appendChild(searchContentLiContainer)
        }

        searchFragment.appendChild(searchItem)
    })

    while (searchResultContainer.firstChild) {
        searchResultContainer.removeChild(searchResultContainer.firstChild)
    }
    searchResultContainer.appendChild(searchFragment)
}

function search() {
    if (!searchField || !searchInput) return

    toggleSeachField()

    window.onkeydown = function (e) {
        if (e.which === 27) {
            toggleSeachField()
        } else if (e.which === 13) {
            var keyword = searchInput.value
            if (keyword) {
                searchFromKeyWord(keyword)
            }
        }
    }

    if (!searchJson) {
        var isXml = false
        var search_path = window.hexo_search_path
        if (search_path.length === 0) {
            search_path = 'search.json'
        } else if (/xml$/i.test(search_path)) {
            isXml = true
        }
        var path = window.hexo_root + search_path
        fetch(path)
            .then(function (res) { return isXml ? res.text() : res.json() })
            .then(function (res) {
                if (isXml) {
                    var parser = new DOMParser()
                    var doc = parser.parseFromString(res, 'application/xml')
                    searchJson = Array.from(doc.querySelectorAll('entry')).map(function (entry) {
                        return {
                            title: entry.querySelector('title').textContent,
                            content: entry.querySelector('content').textContent,
                            url: entry.querySelector('url').textContent
                        }
                    })
                } else {
                    searchJson = res
                }
            })
            .catch(function (err) {
                console.error('Search load failed:', err)
            })
    }
}

// directory function in post pages
/*****************************************************************************/
function getDistanceOfLeft(obj) {
    var left = 0
    var top = 0
    while (obj) {
        left += obj.offsetLeft
        top += obj.offsetTop
        obj = obj.offsetParent
    }
    return {
        left: left,
        top: top
    }
}

var toc = document.getElementById('toc')
var tocToTop = toc ? getDistanceOfLeft(toc).top : 0

function reHeightToc() {
    if (toc) {
        toc.style.maxHeight = (document.documentElement.clientHeight - 10) + 'px'
        toc.style.overflowY = 'scroll'
    }
}

reHeightToc()

if (window.isPost && toc && toc.children && toc.children[0]) {
    var result = []
    var nameSet = new Set()

    if (toc.children[0].nodeName === 'OL') {
        var ol = Array.from(toc.children[0].children)

        function getArrayFromOl(ol) {
            var result = []

            ol.forEach(function (item) {
                var link = item.children[0]
                if (!link) return

                var value = link.getAttribute('href').replace(/^#/, '')
                nameSet.add(value)

                if (item.children.length === 1) {
                    result.push({
                        value: [value],
                        dom: item
                    })
                } else {
                    var childList = item.children[1]
                    var concatArray = childList ? getArrayFromOl(Array.from(childList.children)) : []
                    result.push({
                        value: [value].concat(concatArray.reduce(function (p, n) {
                            p = p.concat(n.value)
                            return p
                        }, [])),
                        dom: item
                    })
                    result = result.concat(concatArray)
                }
            })
            return result
        }

        result = getArrayFromOl(ol)
    }

    var nameArray = Array.from(nameSet)

    function reLayout() {
        var scrollToTop = document.documentElement.scrollTop || window.pageYOffset
        if (tocToTop === 0) {
            toc = document.getElementById('toc')
            if (!toc) return
            toc.classList.remove('toc-fixed')
            tocToTop = getDistanceOfLeft(toc).top
        }
        if (tocToTop <= scrollToTop + 10) {
            if (!toc.classList.contains('toc-fixed')) toc.classList.add('toc-fixed')
        } else if (toc.classList.contains('toc-fixed')) {
            toc.classList.remove('toc-fixed')
        }

        var minTop = 9999
        var minTopsValue = ''

        nameArray.forEach(function (item) {
            item = decodeURIComponent(item)
            var dom = document.getElementById(item) || document.getElementById(item.replace(/\s/g, ''))
            if (!dom) return

            var toTop = getDistanceOfLeft(dom).top - scrollToTop
            if (Math.abs(toTop) < minTop) {
                minTop = Math.abs(toTop)
                minTopsValue = item
            }
        })

        if (minTopsValue) {
            result.forEach(function (item) {
                if (item.value.indexOf(encodeURIComponent(minTopsValue)) !== -1) {
                    item.dom.classList.add('active')
                } else {
                    item.dom.classList.remove('active')
                }
            })
        }
    }

    reLayout()

    window.addEventListener('scroll', function () {
        reLayout()
    })
}

// donate
/*****************************************************************************/
var donateButton = document.getElementById('donate-button')
var donateImgContainer = document.getElementById('donate-img-container')
var donateImg = document.getElementById('donate-img')

if (donateButton && donateImgContainer) {
    donateButton.addEventListener('click', function () {
        if (donateImgContainer.classList.contains('hide')) {
            donateImgContainer.classList.remove('hide')
        } else {
            donateImgContainer.classList.add('hide')
        }
    })

    if (donateImg && donateImg.dataset.src) {
        donateImg.src = donateImg.dataset.src
    }
}
