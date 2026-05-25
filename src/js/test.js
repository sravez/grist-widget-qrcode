import QRCF from "../lib/QRCodeFactory.class.js"

window.onload = () => {
    const f = new QRCF(0, "Q", {bgColor:"#000000", fgColor:"#00ff00"})
    const r = f.getQRCanvas("http://www.apple.com")
    const img = document.getElementById("qrc")
    img.src = r.canvas.toDataURL("image/png")
}
