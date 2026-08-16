!function () {
    var initCopyCode = function () {
        // 创建查看代码的模态弹窗（全局只一个）
        var modalHtml = `
            <div class="code-modal" id="code-modal">
                <div class="code-modal-overlay"></div>
                <div class="code-modal-content">
                    <div class="code-modal-header">
                        <span class="code-modal-title">查看代码</span>
                        <button class="code-modal-copy">
                            <i class="fa fa-clipboard"></i> <span>复制</span>
                        </button>
                        <button class="code-modal-close">
                            <i class="fa fa-times"></i>
                        </button>
                    </div>
                    <div class="code-modal-body">
                        <pre></pre>
                    </div>
                </div>
            </div>
        `;
        if (!document.getElementById('code-modal')) {
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }

        var modal = document.getElementById('code-modal');
        var modalOverlay = modal.querySelector('.code-modal-overlay');
        var modalClose = modal.querySelector('.code-modal-close');
        var modalCopy = modal.querySelector('.code-modal-copy');
        var modalBody = modal.querySelector('.code-modal-body pre');
        var modalTitle = modal.querySelector('.code-modal-title');

        function closeModal() {
            modal.classList.remove('is-visible');
            document.body.style.overflow = '';
        }
        function openModal(code, lang) {
            modalTitle.textContent = lang ? '查看代码 — ' + lang : '查看代码';
            modalBody.textContent = code;
            modal.classList.add('is-visible');
            document.body.style.overflow = 'hidden';
        }

        modalOverlay.addEventListener('click', closeModal);
        modalClose.addEventListener('click', closeModal);
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('is-visible')) {
                closeModal();
            }
        });

        // 模态弹窗中的复制按钮
        modalCopy.addEventListener('click', function() {
            var text = modalBody.textContent;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function() {
                    showCopySuccess(modalCopy);
                }).catch(function() {
                    fallbackCopy(text, modalCopy);
                });
            } else {
                fallbackCopy(text, modalCopy);
            }
        });

        function fallbackCopy(text, btn) {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
                showCopySuccess(btn);
            } catch(e) {
                showCopyError(btn);
            }
            document.body.removeChild(ta);
        }

        function showCopySuccess(btn) {
            var span = btn.querySelector('span');
            var icon = btn.querySelector('i');
            span.textContent = '已复制';
            icon.className = 'fa fa-check';
            btn.classList.add('is-copied');
            setTimeout(function() {
                span.textContent = '复制';
                icon.className = 'fa fa-clipboard';
                btn.classList.remove('is-copied');
            }, 2000);
        }

        function showCopyError(btn) {
            var span = btn.querySelector('span');
            var icon = btn.querySelector('i');
            span.textContent = '失败';
            icon.className = 'fa fa-times';
            setTimeout(function() {
                span.textContent = '复制';
                icon.className = 'fa fa-clipboard';
            }, 2000);
        }

        // 为每个代码块添加操作按钮
        var actionsHtml = function(lang) {
            var langLabel = lang ? '<span class="code-lang">' + lang + '</span>' : '';
            return '<div class="code-actions">'
                + langLabel
                + '<button class="btn-copy" title="复制代码"><i class="fa fa-clipboard"></i><span>复制</span></button>'
                + '<button class="btn-view-raw" title="查看源码"><i class="fa fa-expand"></i><span>查看</span></button>'
                + '</div>';
        };

        document.querySelectorAll('.highlight').forEach(function(block) {
            // 检测语言
            var lang = '';
            var langClass = block.querySelector('[class*="language-"]');
            if (langClass) {
                var m = langClass.className.match(/language-(\w+)/);
                if (m) lang = m[1];
            }
            if (!lang) {
                var figcaption = block.querySelector('figcaption');
                if (figcaption) lang = figcaption.textContent.trim();
            }

            block.insertAdjacentHTML('afterbegin', actionsHtml(lang));

            // 查看按钮
            block.querySelector('.btn-view-raw').addEventListener('click', function() {
                var codeEl = block.querySelector('.code') || block.querySelector('code');
                var code = codeEl ? codeEl.innerText : '';
                openModal(code, lang);
            });
        });

        // 复制功能 — 使用 ClipboardJS
        if (typeof ClipboardJS !== 'undefined') {
            var clipboard = new ClipboardJS('.btn-copy', {
                target: function (trigger) {
                    return trigger.closest('.highlight').querySelector('.code');
                }
            });
            clipboard.on('success', function (e) {
                var btn = e.trigger;
                var span = btn.querySelector('span');
                var icon = btn.querySelector('i');
                span.textContent = '已复制';
                icon.className = 'fa fa-check';
                btn.classList.add('is-copied');
                setTimeout(function () {
                    span.textContent = '复制';
                    icon.className = 'fa fa-clipboard';
                    btn.classList.remove('is-copied');
                }, 2000);
                e.clearSelection();
            });
            clipboard.on('error', function (e) {
                var btn = e.trigger;
                var span = btn.querySelector('span');
                var icon = btn.querySelector('i');
                span.textContent = '失败';
                icon.className = 'fa fa-times';
                setTimeout(function () {
                    span.textContent = '复制';
                    icon.className = 'fa fa-clipboard';
                }, 2000);
                e.clearSelection();
            });
        } else {
            // ClipboardJS 不可用时回退
            document.querySelectorAll('.btn-copy').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var codeEl = btn.closest('.highlight').querySelector('.code');
                    if (!codeEl) return;
                    fallbackCopy(codeEl.innerText, btn);
                });
            });
        }
    }

    initCopyCode();
}();
