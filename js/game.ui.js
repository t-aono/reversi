"use strict";
if (window.game === undefined) { window.game = {} }
if (window.game.ui === undefined) { window.game.ui = {} }

(function () {
  var _t = game.ui;
  var _ga = null;
  var _gcnvs = null;

  // 変数の初期化
  _t.c = {};		// キャンバス系オブジェクト
  _t.l = {	  	// レイアウト系オブジェクト
    fntFmly: ""	// フォントの種類
  };
  _t.fncs = {};

  // 初期化
  _t.init = function (c, l) {
    _ga = game.anim;
    _gcnvs = game.canvas;

    $.extend(true, _t.c, c);
    $.extend(true, _t.l, l);
  };

  // ボタン追加
  _t.addBtn = function (nm, txt, x, y, w, h, cb) {
    var cntx = _t.c.cntx;
    var m = w * 0.05;	  // マージン
    m = m < 4 ? 4 : m;	// 最小は4
    var fntSz = (h - m * 2) | 0;
    var isHover = false;
    var scl = _gcnvs.scl;

    // アニメ追加
    _ga.add(nm, function () {
      cntx.save();

      cntx.fillStyle = isHover ? "#222" : "#000";
      _gcnvs.pthRRct(cntx, x, y, w, h, m);
      cntx.fill();

      cntx.fillStyle = isHover ? "#888" : "#fff";
      _gcnvs.pthRRct(cntx, x + 2, y + 2, w - 4, h - 4, m - 2);
      cntx.fill();

      cntx.fillStyle = isHover ? "#fff" : "#000";
      cntx.textAlign = "center";
      cntx.textBaseline = "middle";
      cntx.font = fntSz + "px '" + _t.l.fntFmly + "'";
      cntx.fillText(txt, x + w * 0.5, y + h * 0.5, w - m * 2);

      cntx.restore();
    });

    // クリック用の処理
    var fncClck = function (e) {
      if (game.core.inRng(e.offsetX * scl, e.offsetY * scl, x, y, w, h)) {
        cb();
      }
    };

    // hover用の処理
    var fncMMv = function (e) {
      isHover = game.core.inRng(e.offsetX * scl, e.offsetY * scl, x, y, w, h);
    };
    var fncMLv = function (e) { isHover = false };

    // 処理を設定
    $(_t.c.cnvs).on("click", fncClck);
    $(_t.c.cnvs).on("mouseleave", fncMLv);
    $(_t.c.cnvs).on("mousemove", fncMMv);

    // 処理を記録
    _t.fncs[nm + ":click"] = fncClck;
    _t.fncs[nm + ":mousemove"] = fncMMv;
    _t.fncs[nm + ":mouseleave"] = fncMLv;
  };

  // ボタン破棄
  _t.rmvBtn = function (nm) {
    _ga.rmv(nm);	// アニメ削除

    // 処理を除去
    $(_t.c.cnvs).off("click", _t.fncs[nm + ":click"]);
    $(_t.c.cnvs).off("mousemove", _t.fncs[nm + ":mousemove"]);
    $(_t.c.cnvs).off("mouseleave", _t.fncs[nm + ":mouseleave"]);

    // 処理を削除
    delete _t.fncs[nm + ":click"];
    delete _t.fncs[nm + ":mousemove"];
    delete _t.fncs[nm + ":mouseleave"];
  };

})();