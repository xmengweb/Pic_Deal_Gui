// Load 'opencv.js' assigning the value to the global variable 'cv'
const { desktopCapturer } = require("electron");
const cv = require("./opencv.js");
const Util = require("./Utils");

//读入图片选择框元素
const inputEl = document.querySelector("#file");
//读入的图片
const Img = document.querySelector("#inputImg");
const util = new Util("errorMessage");

//使用目标检测
let faceCascadeFile = "haarcascade_frontalface_default.xml";
let eyeCascadeFile = "haarcascade_eye.xml";
function readCade() {
  util.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
    console.log("cascade1 ready to load.");
  });
  util.createFileFromUrl(eyeCascadeFile, eyeCascadeFile, () => {
    console.log("cascade2 ready to load.");
  });
}
readCade();

inputEl.addEventListener("change", (event) => {
  const filelist = event.target.files;
  Img.src = filelist[0].path;
});

document.querySelector("#scaling").addEventListener("click", () => {
  let src = cv.imread(Img);
  let dst = new cv.Mat();
  let dsize = new cv.Size(300, 300);
  cv.resize(src, dst, dsize, 0, 0, cv.INTER_AREA);
  cv.imshow("canvasOutput", dst);
  src.delete();
  dst.delete();
});

document.querySelector("#translation").addEventListener("click", () => {
  let src = cv.imread(Img);
  let dst = new cv.Mat();
  let M = cv.matFromArray(2, 3, cv.CV_64FC1, [1, 0, 50, 0, 1, 100]);
  let dsize = new cv.Size(src.rows, src.cols);
  // You can try more different parameters
  cv.warpAffine(
    src,
    dst,
    M,
    dsize,
    cv.INTER_LINEAR,
    cv.BORDER_CONSTANT,
    new cv.Scalar()
  );
  cv.imshow("canvasOutput", dst);
  src.delete();
  dst.delete();
  M.delete();
});

document.querySelector("#rotation").addEventListener("click", () => {
  let src = cv.imread(Img);
  let dst = new cv.Mat();
  let dsize = new cv.Size(src.rows, src.cols);
  let center = new cv.Point(src.cols / 2, src.rows / 2);
  // You can try more different parameters
  let M = cv.getRotationMatrix2D(center, 45, 1);
  cv.warpAffine(
    src,
    dst,
    M,
    dsize,
    cv.INTER_LINEAR,
    cv.BORDER_CONSTANT,
    new cv.Scalar()
  );
  cv.imshow("canvasOutput", dst);
  src.delete();
  dst.delete();
  M.delete();
});

document.querySelector("#graying").addEventListener("click", () => {
  let src = cv.imread(Img);
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  cv.imshow("canvasOutput", gray);
  src.delete();
  dst.delete();
});

document.querySelector("#binaryzation").addEventListener("click", () => {
  let src = cv.imread(Img);
  let dst = new cv.Mat();
  cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
  // You can try more different parameters
  cv.adaptiveThreshold(
    src,
    dst,
    200,
    cv.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv.THRESH_BINARY,
    3,
    2
  );
  cv.imshow("canvasOutput", dst);
  src.delete();
  dst.delete();
});

document.querySelector("#histogramfind").addEventListener("click", () => {
  let src = cv.imread(Img);
  cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
  let srcVec = new cv.MatVector();
  srcVec.push_back(src);
  let accumulate = false;
  let channels = [0];
  let histSize = [256];
  let ranges = [0, 255];
  let hist = new cv.Mat();
  let mask = new cv.Mat();
  let color = new cv.Scalar(255, 255, 255);
  let scale = 2;
  // You can try more different parameters
  cv.calcHist(srcVec, channels, mask, hist, histSize, ranges, accumulate);
  let result = cv.minMaxLoc(hist, mask);
  let max = result.maxVal;
  let dst = new cv.Mat.zeros(src.rows, histSize[0] * scale, cv.CV_8UC3);
  // draw histogram
  for (let i = 0; i < histSize[0]; i++) {
    let binVal = (hist.data32F[i] * src.rows) / max;
    let pioint1 = new cv.Point(i * scale, src.rows - 1);
    let pioint2 = new cv.Point((i + 1) * scale - 1, src.rows - binVal);
    cv.rectangle(dst, pioint1, pioint2, color, cv.FILLED);
  }
  cv.imshow("canvasOutput", dst);
  src.delete();
  dst.delete();
  srcVec.delete();
  mask.delete();
  hist.delete();
});

document.querySelector("#histogramequal").addEventListener("click", () => {
  let src = cv.imread(Img);
  let dst = new cv.Mat();
  cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
  cv.equalizeHist(src, dst);
  cv.imshow("canvasOutput", src);
  cv.imshow("canvasOutput", dst);
  src.delete();
  dst.delete();
});

document.querySelector("#face").addEventListener("click", () => {
  let src = cv.imread(Img);
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
  let faces = new cv.RectVector();
  let eyes = new cv.RectVector();
  let faceCascade = new cv.CascadeClassifier();
  let eyeCascade = new cv.CascadeClassifier();
  // load pre-trained classifiers
  faceCascade.load(faceCascadeFile);
  eyeCascade.load(eyeCascadeFile);
  // detect faces
  let msize = new cv.Size(0, 0);
  faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0, msize, msize);
  for (let i = 0; i < faces.size(); ++i) {
    let roiGray = gray.roi(faces.get(i));
    let roiSrc = src.roi(faces.get(i));
    let point1 = new cv.Point(faces.get(i).x, faces.get(i).y);
    let point2 = new cv.Point(
      faces.get(i).x + faces.get(i).width,
      faces.get(i).y + faces.get(i).height
    );
    cv.rectangle(src, point1, point2, [255, 0, 0, 255]);
    // detect eyes in face ROI
    eyeCascade.detectMultiScale(roiGray, eyes);
    for (let j = 0; j < eyes.size(); ++j) {
      let point1 = new cv.Point(eyes.get(j).x, eyes.get(j).y);
      let point2 = new cv.Point(
        eyes.get(j).x + eyes.get(j).width,
        eyes.get(j).y + eyes.get(j).height
      );
      cv.rectangle(roiSrc, point1, point2, [0, 0, 255, 255]);
    }
    roiGray.delete();
    roiSrc.delete();
  }
  cv.imshow("canvasOutput", src);
  src.delete();
  gray.delete();
  faceCascade.delete();
  eyeCascade.delete();
  faces.delete();
  eyes.delete();
});

document.querySelector("#edge").addEventListener("click", () => {
  let src = cv.imread(Img);
  let dst = new cv.Mat();
  cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
  // You can try more different parameters
  cv.Canny(src, dst, 50, 100, 3, false);
  cv.imshow("canvasOutput", dst);
  src.delete();
  dst.delete();
});

document.querySelector("#save").addEventListener("click", () => {
  // 通过 API 获取目标 canvas 元素
  const canvas = document.querySelector("#canvasOutput");

  // 创建一个 a 标签，并设置 href 和 download 属性
  const el = document.createElement("a");
  // 设置 href 为图片经过 base64 编码后的字符串，默认为 png 格式
  el.href = canvas.toDataURL();
  el.download = "png_output";

  // 创建一个点击事件并对 a 标签进行触发
  const event = new MouseEvent("click");
  el.dispatchEvent(event);
});

document.querySelector("#close").addEventListener("click", () => {
  Img.src = "";
  document.querySelector("#canvasOutput").remove();
  document
    .querySelector("#inputImg")
    .afterend(document.createElement("canvas"));
});

document.querySelector("#sobel").addEventListener("click", () => {
  let src = cv.imread(Img);
  let dstx = new cv.Mat();
  let dsty = new cv.Mat();
  cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
  // You can try more different parameters
  cv.Sobel(src, dstx, cv.CV_8U, 1, 0, 3, 1, 0, cv.BORDER_DEFAULT);
  cv.Sobel(src, dsty, cv.CV_8U, 0, 1, 3, 1, 0, cv.BORDER_DEFAULT);
  // cv.Scharr(src, dstx, cv.CV_8U, 1, 0, 1, 0, cv.BORDER_DEFAULT);
  // cv.Scharr(src, dsty, cv.CV_8U, 0, 1, 1, 0, cv.BORDER_DEFAULT);
  cv.imshow("canvasOutput", dstx);
  cv.imshow("canvasOutputy", dsty);
  src.delete();
  dstx.delete();
  dsty.delete();
});

document.querySelector("#Laplacian").addEventListener("click", () => {
  let src = cv.imread(Img);
  let dst = new cv.Mat();
  cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
  // You can try more different parameters
  cv.Laplacian(src, dst, cv.CV_8U, 1, 1, 0, cv.BORDER_DEFAULT);
  cv.imshow("canvasOutput", dst);
  src.delete();
  dst.delete();
});

document.querySelector("#Convolution2D").addEventListener("click", () => {
  let src = cv.imread(Img);
  let dst = new cv.Mat();
  let M = cv.Mat.eye(3, 3, cv.CV_32FC1);
  let anchor = new cv.Point(-1, -1);
  // You can try more different parameters
  cv.filter2D(src, dst, cv.CV_8U, M, anchor, 0, cv.BORDER_DEFAULT);
  cv.imshow("canvasOutput", dst);
  src.delete();
  dst.delete();
  M.delete();
});
document.querySelector("#blur").addEventListener("click", () => {
  let src = cv.imread(Img);
  let dst = new cv.Mat();
  let ksize = new cv.Size(3, 3);
  let anchor = new cv.Point(-1, -1);
  // You can try more different parameters
  cv.blur(src, dst, ksize, anchor, cv.BORDER_DEFAULT);
  // cv.boxFilter(src, dst, -1, ksize, anchor, true, cv.BORDER_DEFAULT)
  cv.imshow("canvasOutput", dst);
  src.delete();
  dst.delete();
});
document.querySelector("#Gaussblur").addEventListener("click", () => {
  let src = cv.imread(Img);
  let dst = new cv.Mat();
  let ksize = new cv.Size(3, 3);
  let anchor = new cv.Point(-1, -1);
  // You can try more different parameters
  cv.blur(src, dst, ksize, anchor, cv.BORDER_DEFAULT);
  // cv.boxFilter(src, dst, -1, ksize, anchor, true, cv.BORDER_DEFAULT)
  cv.imshow("canvasOutput", dst);
  src.delete();
  dst.delete();
});

document.querySelector("#medianBlur").addEventListener("click", () => {
  let src = cv.imread(Img);
  let dst = new cv.Mat();
  // You can try more different parameters
  cv.medianBlur(src, dst, 5);
  cv.imshow("canvasOutput", dst);
  src.delete();
  dst.delete();
});

document.querySelector("#bilateralFilter").addEventListener("click", () => {
  let src = cv.imread(Img);
  let dst = new cv.Mat();
  cv.cvtColor(src, src, cv.COLOR_RGBA2RGB, 0);
  // You can try more different parameters
  cv.bilateralFilter(src, dst, 9, 75, 75, cv.BORDER_DEFAULT);
  cv.imshow("canvasOutput", dst);
  src.delete();
  dst.delete();
});

document.querySelector("#Canny").addEventListener("click", () => {
  let src = cv.imread(Img);
  let dst = new cv.Mat();
  cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
  // You can try more different parameters
  cv.Canny(src, dst, 50, 100, 3, false);
  cv.imshow("canvasOutput", dst);
  src.delete();
  dst.delete();
});

document.querySelector("#dft").addEventListener("click", () => {
  let src = cv.imread(Img);
  cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);

  // get optimal size of DFT
  let optimalRows = cv.getOptimalDFTSize(src.rows);
  let optimalCols = cv.getOptimalDFTSize(src.cols);
  let s0 = cv.Scalar.all(0);
  let padded = new cv.Mat();
  cv.copyMakeBorder(
    src,
    padded,
    0,
    optimalRows - src.rows,
    0,
    optimalCols - src.cols,
    cv.BORDER_CONSTANT,
    s0
  );

  // use cv.MatVector to distribute space for real part and imaginary part
  let plane0 = new cv.Mat();
  padded.convertTo(plane0, cv.CV_32F);
  let planes = new cv.MatVector();
  let complexI = new cv.Mat();
  let plane1 = new cv.Mat.zeros(padded.rows, padded.cols, cv.CV_32F);
  planes.push_back(plane0);
  planes.push_back(plane1);
  cv.merge(planes, complexI);

  // in-place dft transform
  cv.dft(complexI, complexI);

  // compute log(1 + sqrt(Re(DFT(img))**2 + Im(DFT(img))**2))
  cv.split(complexI, planes);
  cv.magnitude(planes.get(0), planes.get(1), planes.get(0));
  let mag = planes.get(0);
  let m1 = new cv.Mat.ones(mag.rows, mag.cols, mag.type());
  cv.add(mag, m1, mag);
  cv.log(mag, mag);

  // crop the spectrum, if it has an odd number of rows or columns
  let rect = new cv.Rect(0, 0, mag.cols & -2, mag.rows & -2);
  mag = mag.roi(rect);

  // rearrange the quadrants of Fourier image
  // so that the origin is at the image center
  let cx = mag.cols / 2;
  let cy = mag.rows / 2;
  let tmp = new cv.Mat();

  let rect0 = new cv.Rect(0, 0, cx, cy);
  let rect1 = new cv.Rect(cx, 0, cx, cy);
  let rect2 = new cv.Rect(0, cy, cx, cy);
  let rect3 = new cv.Rect(cx, cy, cx, cy);

  let q0 = mag.roi(rect0);
  let q1 = mag.roi(rect1);
  let q2 = mag.roi(rect2);
  let q3 = mag.roi(rect3);

  // exchange 1 and 4 quadrants
  q0.copyTo(tmp);
  q3.copyTo(q0);
  tmp.copyTo(q3);

  // exchange 2 and 3 quadrants
  q1.copyTo(tmp);
  q2.copyTo(q1);
  tmp.copyTo(q2);

  // The pixel value of cv.CV_32S type image ranges from 0 to 1.
  cv.normalize(mag, mag, 0, 1, cv.NORM_MINMAX);

  cv.imshow("canvasOutput", mag);
  src.delete();
  padded.delete();
  planes.delete();
  complexI.delete();
  m1.delete();
  tmp.delete();
});

document.querySelector("#easybinaryzation").addEventListener("click", () => {
  let src = cv.imread(Img);
  let dst = new cv.Mat();
  // You can try more different parameters
  cv.threshold(src, dst, 177, 200, cv.THRESH_BINARY);
  cv.imshow("canvasOutput", dst);
  src.delete();
  dst.delete();
});
