(function () {
    const wrapper = document.getElementById('watermark-wrapper');
    const overlay = document.getElementById('editor-overlay');
    const editor = document.getElementById('watermark-editor');
    const handle = document.getElementById('resize-handle');

    let state = { x: 88, y: 1.5, width: 110, height: 45 };
    let drag = null;
    let resize = null;

    function applyWatermark(data) {
        wrapper.style.left = data.x + '%';
        wrapper.style.top = data.y + '%';
        wrapper.style.width = data.width + 'px';
        wrapper.style.height = data.height + 'px';
    }

    function applyEditor(data) {
        editor.style.left = data.x + '%';
        editor.style.top = data.y + '%';
        editor.style.width = data.width + 'px';
        editor.style.height = data.height + 'px';
    }

    function pxToPercX(px) {
        return (px / window.innerWidth) * 100;
    }

    function pxToPercY(py) {
        return (py / window.innerHeight) * 100;
    }

    function clamp(v, mn, mx) {
        return Math.max(mn, Math.min(mx, v));
    }

    editor.addEventListener('mousedown', function (e) {
        if (e.target === handle) return;
        e.preventDefault();
        const rect = editor.getBoundingClientRect();
        drag = {
            offX: e.clientX - rect.left,
            offY: e.clientY - rect.top
        };
    });

    handle.addEventListener('mousedown', function (e) {
        e.preventDefault();
        e.stopPropagation();
        resize = {
            startX: e.clientX,
            startY: e.clientY,
            startW: state.width,
            startH: state.height
        };
    });

    document.addEventListener('mousemove', function (e) {
        if (drag) {
            const nx = clamp(pxToPercX(e.clientX - drag.offX), 0, 100 - pxToPercX(state.width));
            const ny = clamp(pxToPercY(e.clientY - drag.offY), 0, 100 - pxToPercY(state.height));
            state.x = nx;
            state.y = ny;
            applyEditor(state);
        } else if (resize) {
            const dx = e.clientX - resize.startX;
            const dy = e.clientY - resize.startY;
            state.width = Math.max(40, resize.startW + dx);
            state.height = Math.max(20, resize.startH + dy);
            applyEditor(state);
        }
    });

    document.addEventListener('mouseup', function () {
        if (drag || resize) {
            fetch('https://wokn-watermark/updatePosition', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(state)
            });
        }
        drag = null;
        resize = null;
    });

    document.addEventListener('keydown', function (e) {
        if (!overlay.classList.contains('active')) return;
        if (e.key === 'Enter') {
            e.preventDefault();
            overlay.classList.remove('active');
            applyWatermark(state);
            fetch('https://wokn-watermark/saveAndClose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(state)
            });
            fetch('https://wokn-watermark/editorClosed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
        } else if (e.key === 'Escape') {
            e.preventDefault();
            overlay.classList.remove('active');
            fetch('https://wokn-watermark/cancelEditor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            fetch('https://wokn-watermark/editorClosed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
        }
    });

    window.addEventListener('message', function (e) {
        const msg = e.data;
        if (!msg || !msg.type) return;

        if (msg.type === 'init') {
            state = Object.assign(state, msg.data);
            applyWatermark(state);
        } else if (msg.type === 'setWatermark') {
            state = Object.assign(state, msg.data);
            applyWatermark(state);
        } else if (msg.type === 'openEditor') {
            state = Object.assign(state, msg.data);
            applyWatermark(state);
            applyEditor(state);
            overlay.classList.add('active');
        } else if (msg.type === 'closeEditor') {
            overlay.classList.remove('active');
            applyWatermark(state);
        }
    });
})();
