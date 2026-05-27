import QRCF from "../lib/QRCodeFactory.class.js"
import getQRLabel from "./QRLabel.js"


window.onload = () => {
    const qro = {
        type: 0,
        size: 256,
        margin: 20,
        bgColor:"#dddddd",
        fgColor:"#000000",
        errorCorrectionLevel: "H"
    }

    const lbo = {
        ...qro,
        border: 32,
        text_size: 18
    }

    const c = {
        val: "http://www.apple.com?t=kljlkjkljkljlkmjlkjkljljk",
        top: "haut",
        right: "droite",
        bottom: "bas",
        left: "gauche",
    }
    const f = new QRCF(qro)
    try{
        const r = f.getQRCanvas(c.val)
        const imgc = document.getElementById("qrc")
        imgc.src = r.canvas.toDataURL("image/png")
        console.debug("Type :", r.type)

    } catch(e) {
        console.log(e)
    }

    const imgl = document.getElementById("lbl")
    imgl.src = getQRLabel(c, lbo) ?? "./img/qrError.png"

}
