import QRCF from "../lib/QRCodeFactory.class.js"

window.onload = () => {
    const o = {
        cellSize: 4,
        bgColor:"#000000",
        fgColor:"#00ffff"
    }
    const f = new QRCF(o)
    const r = f.getQRCanvas("http://www.apple.com")
    const img = document.getElementById("qrc")
    img.src = r.canvas.toDataURL("image/png")
}
