
function getQRC(val) {
    const img = document.getElementById("img");

    const div = document.createElement('div');
    //const div = document.getElementById('qrcode')
    new QRCode(div, {
        text: val,
        width: 256,
        height: 256,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel["H"]
    });

    const inner_canvas = div.querySelector("canvas");

    const canvas = document.createElement("canvas")
    canvas.width = 272
    canvas.height = canvas.width
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#00bfff";
    ctx.fillRect(0,0, canvas.width, canvas.height);
    ctx.drawImage(inner_canvas, 8, 8)
    img.src = canvas.toDataURL("image/png")

}



window.onload = () => {
    getQRC("http://test.com?sdfssg=sqsgf&dgdg=esgsg&kksdf")
}
