"use strict";
if (window.reversi === undefined) { window.reversi = {} }
if (window.reversi.effect === undefined) { window.reversi.effect = {} }

(function () {
  var _t = reversi.effect;
  var _ga = game.anim;
  var _rvs = null;
  var _rc = null;

  // 初期化
  _t.init = function () {
    _rvs = reversi.reversi;
    _rc = reversi.canvas;
  };

  // 石置き
  _t.putTkn = function () {
    var d = $.Deferred();
    var tmStrt = _ga.tm.sum;
    var tmMax = 250;
    var nm = "putTkn";

    var put = _rvs.put;
    var plyr = _rvs.plyrOld;
    var cntx = _rc.c.cntx;
    var img = resouce.image.imgs["tkn" + plyr];
    var r = _rc.xyToReal(put.x, put.y);
    var gravity = _rc.l.sqSz / 1.5;

    // アニメ追加
    _ga.add(nm, function () {
      var tmDif = _ga.tm.sum - tmStrt;
      if (tmDif < tmMax) {
        // アニメ処理
        cntx.save();
        cntx.translate(r.x + gravity, r.y + gravity);
        for (var i = 1; i <= 4; i++) {
          cntx.globalAlpha = 0.1 * i;
          cntx.rotate(Math.PI * 0.25 * i * tmDif / tmMax);
          cntx.drawImage(img, - gravity, - gravity);
        }
        cntx.restore();
      } else {
        _ga.rmv(nm);	// アニメ削除
        d.resolve();
      }
    });
    return d.promise();
  };

  // 盤面変更
  _t.chngBrd = function () {
    var d = $.Deferred();
    var tmStrt = _ga.tm.sum;
    var tmMax = 750;
    var nm = "chngBrd";

    var put = _rvs.put;
    var plyr = _rvs.plyrOld;
    var tkns = _rvs.revTkns;
    var cntx = _rc.c.cntx;
    var hlfSz = _rc.l.sqSz / 2;

    // アニメ追加
    _ga.add(nm, function () {
      var tmDif = _ga.tm.sum - tmStrt;
      var rt = tmDif / tmMax;
      var rtSz = Math.sin(Math.PI * rt);
      if (tmDif < tmMax) {
        // アニメ処理
        _rc.drwTkn(put.x, put.y, plyr);	// 置き位置

        // 裏返り石の表示遷移
        cntx.save();
        cntx.globalAlpha = rt;
        for (var i = 0; i < tkns.length; i++) {
          _rc.drwTkn(tkns[i].x, tkns[i].y, plyr);
        }
        cntx.restore();

        // 演出
        for (var i = 0; i < tkns.length; i++) {
          var r = _rc.xyToReal(tkns[i].x, tkns[i].y);
          cntx.save();
          cntx.strokeStyle = game.core.rtRGB(
            255, 32, 32, 32, 192, 255, rt);
          cntx.lineWidth = hlfSz * 0.4;
          cntx.globalAlpha = 0.8;
          cntx.translate(r.x + hlfSz, r.y + hlfSz);
          cntx.rotate(Math.PI * 5 * rt);
          var sz = hlfSz * 1.5 * rtSz;
          cntx.strokeRect(-sz, -sz, sz * 2, sz * 2);
          cntx.restore();
        }
      } else {
        _ga.rmv(nm);	// アニメ削除
        d.resolve();
      }
    });
    return d.promise();
  };

  // メッセージ表示
  _t.msg = function (txt) {
    var d = $.Deferred();
    var tmStrt = _ga.tm.sum;
    var tmMax = 750;
    var nm = "msg";

    var cntx = _rc.c.cntx;
    var l = _rc.l;
    var w = _rc.c.w;
    var h = _rc.c.h;
    var cX = w / 2;
    var cY = h / 2;

    // アニメ追加
    _ga.add(nm, function () {
      var tmDif = _ga.tm.sum - tmStrt;
      var rtX = tmDif * 3 > tmMax ? 0 : 1 - (tmDif * 3 / tmMax);
      var rtA = Math.sin(Math.PI * tmDif / tmMax);
      if (tmDif < tmMax) {
        // アニメ処理
        cntx.save();
        cntx.textAlign = "center";
        cntx.textBaseline = "middle";
        cntx.strokeStyle = "#fff";
        cntx.fillStyle = "#000";
        cntx.lineWidth = l.fntSz / 10;
        cntx.font = l.fntSz * 2 + "px '" + l.fntFmly + "'";

        cntx.globalAlpha = rtA;
        for (var i = -1; i <= 1; i += 2) {
          cntx.strokeText(txt, cX + w * rtX * i, cY);
          cntx.fillText(txt, cX + w * rtX * i, cY);
        }
        cntx.restore();
      } else {
        _ga.rmv(nm);	// アニメ削除
        d.resolve();
      }
    });

    return d.promise();
  };

})();
