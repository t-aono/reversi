"use strict";
if (window.game === undefined) { window.game = {} }
if (window.game.canvas === undefined) { window.game.canvas = {} }

(function () {
  var _t = game.canvas;

  // 変数の初期化
  _t.scl = 1;

  // キャンバスの生成
  _t.genCnvs = function (w, h, scl) {
    if (scl === undefined) { scl = 1 }
    var $cnvs = $("<canvas>")
      .attr("width", w * scl).attr("height", h * scl)
      .width(w).height(h);
    var cnvs = $cnvs[0];
    var cntx = cnvs.getContext("2d");
    return { $cnvs: $cnvs, cnvs: cnvs, cntx: cntx, w: w * scl, h: h * scl };
  };

  // 指定ID内に、指定比率でキャンバスを作成して格納
  _t.initCnvs = function (id, w, h, scl) {
    _t.scl = scl;
    var c = this.genCnvs(w, h, scl);
    $("#" + id).empty().append(c.$cnvs);
    return c;
  };

  // サイズ変更画像の取得 戻り値はキャンバス
  _t.getScaledImg = function (img, sx, sy, sw, sh, dw, dh) {
    var rtX = dw / sw;
    var rtY = dh / sh;

    if (rtX >= 0.5 && rtY >= 0.5) {
      // 50%以上
      var c = _t.genCnvs(dw, dh);
      c.cntx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
      return c.cnvs;
    } else {
      // 50%未満
      var w2 = (rtX < 0.5) ? Math.ceil(sw * 0.5) : dw;
      var h2 = (rtY < 0.5) ? Math.ceil(sh * 0.5) : dh;

      var c = _t.genCnvs(w2, h2);
      c.cntx.drawImage(img, sx, sy, sw, sh, 0, 0, w2, h2);
      var newImg = _t.getScaledImg(c.cnvs, 0, 0, w2, h2, dw, dh);
      return newImg;
    }
  };

  // マージン付き矩形塗り潰し
  _t.fllMrgnRct = function (cntx, x, y, w, h, m) {
    var rct = { x: x + m, y: y + m, w: w - m * 2, h: h - m * 2 };
    cntx.fillRect(rct.x, rct.y, rct.w, rct.h);
    return rct;
  };

  // 閉じたパスの塗りつぶし（引数2以降で点XY座標の羅列を渡す）
  _t.fllPth = function (cntx) {
    cntx.beginPath();
    for (var i = 1; i < arguments.length; i += 2) {
      var x = arguments[i];
      var y = arguments[i + 1];
      if (i == 1) {
        cntx.moveTo(x, y);
      } else {
        cntx.lineTo(x, y);
      }
    }
    cntx.closePath();
    cntx.fill();
  };

  // 角丸パス
  _t.pthRRct = function (cntx, x, y, w, h, r) {
    // 変数の初期化
    var x2 = x + w;
    var y2 = y + h;

    // パスの作成
    cntx.beginPath();
    cntx.moveTo(x + r, y);	// 左上
    cntx.arcTo(x2, y, x2, y2, r);	// 右上
    cntx.arcTo(x2, y2, x, y2, r);	// 右下
    cntx.arcTo(x, y2, x, y, r);	// 左下
    cntx.arcTo(x, y, x2, y, r);	// 左上
    cntx.closePath();
  };

})();
