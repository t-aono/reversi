"use strict";
if (window.reversi === undefined) { window.reversi = {} }
if (window.reversi.canvas === undefined) { window.reversi.canvas = {} }

(function () {
  var _t = reversi.canvas;
  var _gcnvs = game.canvas;
  var _gcr = game.core;
  var _imgs = resouce.image.imgs;
  var _rvs = null;
  var _cntx = null;
  var _sqSz = null;

  // 変数の初期化
  _t.c = null;	// キャンバス系オブジェクト
  _t.l = {		  // レイアウト系オブジェクト
    sqSz: 0,	  // マス サイズ
    brdX: 0, brdY: 0,	// 盤面X,Y位置
    brdW: 0, brdH: 0,	// 盤面横幅,高さ
    pScr: [
      { x: 0, y: 0, w: 0, algn: "left" },	// P1スコアXY位置、横幅
      { x: 0, y: 0, w: 0, algn: "right" }	// P2スコアXY位置、横幅
    ],
    fntSz: 0,	// フォントのサイズ
    fntFmly: "ArchivoBlack"	// フォントの種類
  };

  // キャンバスの初期化
  _t.initCnvs = function () {
    _rvs = reversi.reversi;

    // キャンバス系オブジェクトを作成
    var id = "reversi";
    var sz = _gcr.getFitSz(10, 11);
    var scl = 1;
    if (sz.w <= 600) { scl = 2 }	// モバイルのぼやけ対策
    var c = _t.c = _gcnvs.initCnvs(id, sz.w, sz.h, scl);
    _cntx = c.cntx;

    // レイアウトを初期化
    var w = c.w, h = c.h, l = _t.l;
    l.sqSz = (c.w * 0.1) | 0;
    l.brdW = l.sqSz * _rvs.w;
    l.brdH = l.sqSz * _rvs.h;
    l.brdX = ((w - l.brdW) / 2) | 0;
    l.brdY = l.sqSz * 2;
    l.pScr[0].x = l.brdX;
    l.pScr[1].x = l.brdX + l.brdW;
    l.pScr[0].y = l.pScr[1].y = l.sqSz * 1;
    l.pScr[0].w = l.pScr[1].w = l.brdW * 0.35;
    l.fntSz = l.sqSz * 0.9;
    _sqSz = l.sqSz;
  };

  // 盤面XYを座標XYに変換
  _t.xyToReal = function (x, y) {
    var rX = _t.l.brdX + _sqSz * x;
    var rY = _t.l.brdY + _sqSz * y;
    return { x: rX, y: rY };
  };

  // 背景描画
  _t.drwBg = function () {
    _cntx.fillStyle = _cntx.createPattern(_imgs.bg, "repeat");
    _cntx.fillRect(0, 0, _t.c.w, _t.c.h);
  };

  // 1マス描画
  _t.drwSq = function (x, y) {
    var r = _t.xyToReal(x, y);
    var mO = 1, mI = 2;	// マージン アウト、イン
    if (_sqSz >= 60) { mO = 2 }	// 高解像度時は大きく

    _cntx.fillStyle = "#000";
    _cntx.fillRect(r.x, r.y, _sqSz, _sqSz);

    _cntx.fillStyle = "#ffb900";
    _gcnvs.fllMrgnRct(_cntx, r.x, r.y, _sqSz, _sqSz, mO);

    _cntx.fillStyle = "#fff05b";
    _gcnvs.fllMrgnRct(_cntx, r.x, r.y, _sqSz - mI, _sqSz - mI, mO);

    _cntx.fillStyle = "#086319";
    var rct = _gcnvs.fllMrgnRct(_cntx, r.x, r.y, _sqSz, _sqSz, mO + mI);
    var w = rct.w, h = rct.h;

    _cntx.save();
    _cntx.globalAlpha = 0.1;
    _cntx.fillStyle = "#0eb32d";

    _cntx.save();
    _cntx.translate(rct.x, rct.y);
    _gcnvs.fllPth(_cntx, w * 0.4, 0, w * 0.1, h, w * 0.6, h, w * 0.9, 0);
    _cntx.restore();

    _cntx.save();
    _cntx.translate(rct.x, rct.y);
    _gcnvs.fllPth(_cntx, 0, h * 0.1, w, h * 0.4, w, h * 0.9, 0, h * 0.6);
    _cntx.restore();

    _cntx.restore();
  };

  // 盤面全描画
  _t.drwSqAll = function () {
    var l = _t.l;

    // マス周辺の描画
    _cntx.fillStyle = "#000";
    _gcnvs.fllMrgnRct(_cntx, l.brdX, l.brdY, l.brdW, l.brdH, -2);

    // マスの描画
    _rvs.scnBrd(function (i, x, y) { _t.drwSq(x, y) });
  };

  // 石のリサイズ
  _t.rszTkn = function () {
    for (var i = 0; i < 2; i++) {
      var tkn = _imgs["_tkn" + i];
      _imgs["tkn" + i] = game.canvas.getScaledImg(
        tkn, 0, 0, tkn.width, tkn.height, _sqSz, _sqSz
      );
    }
  };

  // 1石描画
  _t.drwTkn = function (x, y, p) {
    if (p < 0 || 1 < p) { return }

    var r = _t.xyToReal(x, y);
    _cntx.drawImage(_imgs["tkn" + p], r.x, r.y);
  };

  // 全石描画
  _t.drwTknAll = function (brd) {
    _rvs.scnBrd(function (i, x, y) { _t.drwTkn(x, y, brd[i]) });
  };

  // 1スコア描画
  _t.drwPScr = function (plyr, scr) {
    var l = _t.l;
    var lScr = l.pScr[plyr];
    var nm = ["YOU", "COM"][plyr];
    scr = ("0" + scr).substr(-2);

    _cntx.textAlign = lScr.algn;
    _cntx.textBaseline = "middle";
    _cntx.fillStyle = "#000";
    _cntx.font = l.fntSz + "px '" + l.fntFmly + "'";
    _cntx.fillText(nm + scr, lScr.x, lScr.y, lScr.w);
  };

  // 全スコア描画
  _t.drwPScrAll = function () {
    _t.drwPScr(0, _rvs.scr[0]);
    _t.drwPScr(1, _rvs.scr[1]);
  };

  // 手番プレイヤー描画
  _t.drwPlyr = function () {
    var l = _t.l;
    var hlfSz = _sqSz / 2;

    _cntx.save();
    _cntx.translate(_t.c.cnvs.width / 2, l.pScr[0].y);
    for (var i = 0; i < 2; i++) {
      // 方向の表示
      var drc = [-1, 1][i];
      _cntx.fillStyle = i == _rvs.plyr ? "#c00" : "#aaa";

      _cntx.beginPath();
      _cntx.rect(hlfSz * drc - hlfSz, -hlfSz, hlfSz * 2, hlfSz * 2);
      _cntx.closePath();
      _cntx.fill();

      // 石の表示
      _cntx.drawImage(_imgs["tkn" + i], hlfSz * drc - hlfSz, - hlfSz);
    }
    _cntx.restore();
  };

  // 配置可能マスを1つ描画
  _t.drwEnblSqs = function (x, y) {
    var r = _t.xyToReal(x, y);
    _cntx.save();
    _cntx.fillStyle = "#ff0";
    _cntx.globalAlpha = 0.66;
    _gcnvs.fllMrgnRct(_cntx, r.x, r.y, _sqSz, _sqSz, 2);
    _cntx.restore();
  }

  // 配置可能マスの全描画
  _t.drwEnblSqsAll = function () {
    var sqs = _rvs.enblSqs;
    for (var i = 0; i < sqs.length; i++) {
      _t.drwEnblSqs(sqs[i].x, sqs[i].y);
    }
  };

  // キャッシュの作成
  _t.genCsh = function () {
    var c = _imgs["cshBg"];
    if (!c) {
      c = _imgs["cshBg"] = _gcnvs.genCnvs(_t.c.w, _t.c.h);
    }
    c.cntx.drawImage(_t.c.cnvs, 0, 0);
  };

  // キャッシュの描画
  _t.drwCsh = function () {
    _cntx.drawImage(_imgs.cshBg.cnvs, 0, 0);
  };


})();