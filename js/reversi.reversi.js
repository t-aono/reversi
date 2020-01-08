"use strict";
if (window.reversi === undefined) { window.reversi = {} }
if (window.reversi.reversi === undefined) { window.reversi.reversi = {} }

(function () {
  var _t = reversi.reversi;

  // 変数の初期化
  _t.BLNK = -1;	// 空白マス（石のあるマスはプレイヤー番号）
  _t.PTYP = { man: "MAN", com: "COM" };	// プレイヤー種類
  _t.DRC = [	// 方向
    { x: 0, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 },
    { x: 0, y: 1 }, { x: -1, y: 1 }, { x: -1, y: 0 }, { x: -1, y: -1 }];

  // 変数の初期化
  _t.w = _t.h = 8;
  _t.brd = [];
  _t.plyr = 0;
  _t.plyrOld = 1;
  _t.pTypArr = [_t.PTYP.man, _t.PTYP.com];	// man, com
  _t.put = {};		// 最終置き位置
  _t.revTkns = [];	// 裏返った石配列

  // その他変数
  _t.scr = [0, 0];	// 獲得石数
  _t.enblSqs = [];	// 配置可能マス配列
  _t.isEnd = false;	// 終了フラグ

  // 盤面初期化
  _t.init = function () {
    _t.plyr = 0;
    _t.plyrOld = 1;
    _t.put = {};		// 最終置き位置
    _t.revTkns = [];	// 裏返った石配列

    // 初期配置
    _t.scnBrd(function (i) { _t.brd[i] = _t.BLNK });
    _t.brd[_t.XYToI(3, 3)] = _t.brd[_t.XYToI(4, 4)] = 0;
    _t.brd[_t.XYToI(3, 4)] = _t.brd[_t.XYToI(4, 3)] = 1;

    _t.enblSqs = _t.getEnblSqs(_t.brd, _t.plyr);	// 配列の取得
    var enblSqs2 = _t.getEnblSqs(_t.brd, 1 - _t.plyr);
    _t.isEnd = _t.enblSqs.length == 0 && enblSqs2.length == 0;
  };

  // 盤面走査
  _t.scnBrd = function (fnc) {
    var w = _t.w, h = _t.h;
    var max = w * h;
    for (var i = 0; i < max; i++) {
      var x = i % w, y = (i / w) | 0;
      fnc(i, x, y);
    }
  };

  // 盤面変換
  _t.XYToI = function (x, y) {
    if (x < 0 || y < 0) { return undefined }
    if (x >= _t.w || y >= _t.h) { return undefined }
    return (x + y * _t.w) | 0;
  };

  // 1列走査
  _t.scnLn = function (brd, x, y, dX, dY) {
    var ptrn = "", arr = [];
    for (var m = 1; ; m++) {
      var cX = x + dX * m;
      var cY = y + dY * m;
      var i = _t.XYToI(cX, cY);
      if (i === undefined) { break }

      var sq = brd[i];
      if (sq == _t.BLNK) { ptrn += "B" }
      else { ptrn += sq }
      arr.push({ x: cX, y: cY });
    }
    return { ptrn: ptrn, arr: arr };
  };

  // 配置可能マス配列の取得
  _t.getEnblSqs = function (brd, plyr) {
    var res = [];
    var plyrEne = 1 - plyr;
    _t.scnBrd(function (i, x, y) {
      if (brd[i] != _t.BLNK) { return }

      for (var j = 0; j < 8; j++) {
        var ln = _t.scnLn(brd, x, y, _t.DRC[j].x, _t.DRC[j].y);
        var re = new RegExp("^" + plyrEne + "+" + plyr);
        if (ln.ptrn.match(re)) {
          res.push({ x: x, y: y });
          return;
        }
      }
    });
    return res;
  };

  // 石置き処理
  _t.putTkn = function (x, y) {
    // 石置き可能かの判定
    for (var i = 0; i < _t.enblSqs.length; i++) {
      var eSq = _t.enblSqs[i];
      if (eSq.x == x && eSq.y == y) {
        // 石置き後盤面の作成
        _t.put = { x: x, y: y };				    // 最終置き位置
        _t.execRvrs(x, y, _t.brd, _t.plyr);	// 裏返し処理
        nxt();		  	// 進行処理
        return true;	// 石置き可能
      }
    }
    return false;	// 石置き不能
  };

  // 裏返し処理
  _t.execRvrs = function (x, y, brd, plyr) {
    _t.revTkns = [];	// 裏返った石配列
    var plyrEne = 1 - plyr;

    for (var i = 0; i < 8; i++) {
      var ln = _t.scnLn(brd, x, y, _t.DRC[i].x, _t.DRC[i].y);
      var re = new RegExp("^(" + plyrEne + "+)" + plyr);
      var m = ln.ptrn.match(re);
      if (m == null) { continue }
      for (var j = 0; j < m[1].length; j++) {
        brd[_t.XYToI(ln.arr[j].x, ln.arr[j].y)] = plyr;
        _t.revTkns.push(ln.arr[j]);
      }
    }
    brd[_t.XYToI(x, y)] = plyr;	// 開始マスを変更
  };

  // 進行処理 (private)
  var nxt = function () {
    _t.plyrOld = _t.plyr;
    _t.plyr = 1 - _t.plyr;

    _t.enblSqs = _t.getEnblSqs(_t.brd, _t.plyr);	// 配列の取得
    var enblSqs2 = _t.getEnblSqs(_t.brd, 1 - _t.plyr);
    _t.isEnd = _t.enblSqs.length == 0 && enblSqs2.length == 0;

    _t.scr[0] = _t.clcScr(0, _t.brd);	// 獲得石数P0
    _t.scr[1] = _t.clcScr(1, _t.brd);	// 獲得石数P1
  };

  // スコア計算
  _t.clcScr = function (p, brd) {
    var cnt = 0;
    _t.scnBrd(function (i) {
      if (brd[i] == p) { cnt++ }
    });
    return cnt;
  };

  // スキップ
  _t.skp = function () { nxt() };

  // プレイヤー種類取得
  _t.getPTyp = function () { return _t.pTypArr[_t.plyr] };

})();