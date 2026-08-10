!function () {
    var initCopyCode = function () {
        // 按钮容器（复制 + 查看）
        var actionsHtml = `
            <div class="code-actions">
                <button class="btn-copy" data-clipboard-snippet="">
                    <i class="fa fa-clipboard"></i><span>复制</span>
                </button>
                <button class="btn-view-raw">
                    <i class="fa fa-expand"></i><span>查看</span>
                </button>
            </div>
        `;
        $(".highlight").prepend(actionsHtml);

        // 悬停显示按钮
        $(".highlight").hover(
            function () {
                $(this).find(".code-actions").fadeIn(100);
            },
            function () {
                $(this).find(".code-actions").fadeOut(100);
            }
        );

        // 复制功能
        var clipboard = new ClipboardJS('.btn-copy', {
            target: function (trigger) {
                return trigger.closest(".highlight").querySelector(".code");
            }
        });
        clipboard.on('success', function (e) {
            e.trigger.innerHTML = "<i class='fa fa-check'></i><span>复制成功</span>";
            setTimeout(function () {
                e.trigger.innerHTML = "<i class='fa fa-clipboard'></i><span>复制</span>";
            }, 1000);
            e.clearSelection();
        });
        clipboard.on('error', function (e) {
            e.trigger.innerHTML = "<i class='fa fa-times'></i><span>复制失败</span>";
            setTimeout(function () {
                e.trigger.innerHTML = "<i class='fa fa-clipboard'></i><span>复制</span>";
            }, 1000);
            e.clearSelection();
        });

        // 查看功能
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('.btn-view-raw').forEach(button => {
                button.addEventListener('click', function() {
                    const codeElement = this.closest(".highlight").querySelector(".code");
                    if (!codeElement) {
                        alert('未找到代码元素');
                        return;
                    }
                    const codeContent = codeElement.innerText;
        
                    const newWindow = window.open('', '_blank');
                    if (!newWindow) {
                        alert('浏览器阻止了新窗口的打开，请允许弹出窗口');
                        return;
                    }
                    newWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>view code</title>
                            <style>
                                body { background-color: #f5f5f5; padding: 20px; margin: 0; }
                                .code-container { background-color: #282c34; color: #abb2bf; padding: 16px; border-radius: 6px; font-family: 'Consolas', 'Courier New', monospace; }
                                pre { margin: 0; white-space: pre-wrap; word-wrap: break-word; line-height: 1.5; }
                            </style>
                        </head>
                        <body>
                            <div class="code-container"><pre>${codeContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></div>
                        </body>
                        </html>
                    `);
                    newWindow.document.close(); // 确保文档写入完成
                });
            });
        });
    }
    initCopyCode();
}();