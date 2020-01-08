"use strict";
if (window.reversi === undefined) { window.reversi = {} }
if (window.reversi.com === undefined) { window.reversi.com = {} }

(function () {
  var _t = reversi.com;
  var _rvs = null;

  // 盤面の位置を得点化する
  _t.tblOfPnt = [
    64, 1, 8, 4, 4, 8, 1, 64,
    1, 1, 10, 12, 12, 10, 1, 1,
    8, 10, 14, 16, 16, 14, 10, 8,
    4, 12, 16, 1, 1, 16, 12, 4,
    4, 12, 16, 1, 1, 16, 12, 4,
    8, 10, 14, 16, 16, 14, 10, 8,
    1, 1, 10, 12, 12, 10, 1, 1,
    64, 1, 8, 4, 4, 8, 1, 64
  ];

  // COMの指し手を取得
  _t.get = function () {
    _rvs = reversi.reversi;
    var res = comIn(_rvs.brd, _rvs.plyr, _rvs.enblSqs, 0);
    return res.put;
  };

  // COMの内部処理
  var comIn = function (brd, plyr, enblSqs, nst) {
    var put = null;	// 指し手
    var max = -99999999;	// 得点の初期値
    var plyrEne = 1 - plyr;
    var DRC = _rvs.DRC;
    for (var i = 0; i < enblSqs.length; i++) {
      var sq = enblSqs[i];
      var pnt = _t.tblOfPnt[_rvs.XYToI(sq.x, sq.y)];

      // 外周判定
      var arndOut = 0, arndEne = 0;
      for (var j = 0; j < 8; j++) {
        var ln = _rvs.scnLn(brd, sq.x, sq.y, DRC[j].x, DRC[j].y);
        if (ln.ptrn.length == 0) { arndOut++; continue }
        if (DRC[j].x * DRC[j].y != 0) { continue }	// 縦横のみ

        var re = new RegExp("^" + plyrEne + "+(B|$)");
        if (ln.ptrn.match(re)) { arndEne++; continue }

        var re = new RegExp("^%e+%p+%e+(B|$)"
          .replace(/%e/g, plyrEne).replace(/%p/g, plyr));
        if (ln.ptrn.match(re)) { arndEne++; continue }

        var re = new RegExp("^%e+%p+$"
          .replace(/%e/g, plyrEne).replace(/%p/g, plyr));
        if (ln.ptrn.match(re)) { arndEne++; continue }
      }
      if (arndOut == 3 && arndEne == 3) { pnt += 32 }

      // 次手の確認
      var brdCpy = brd.concat();
      _rvs.execRvrs(sq.x, sq.y, brdCpy, plyr);
      var enblSqsNxt = _rvs.getEnblSqs(brdCpy, plyrEne);
      if (nst == 0) {	/* 相手の最大得点を引く */
        var res = comIn(brdCpy, plyrEne, enblSqsNxt, nst + 1);
        pnt -= res.max;
      }
      if (nst == 1) {	/* 全滅の回避 */
        // 次番手の相手（この場合はCOM）が打てないか確認
        if (enblSqsNxt.length == 0) { pnt += 64 }
      }

      // 最大得点時の更新処理
      if (pnt > max) {
        max = pnt;
        put = sq;
      }
    }
    return { put: put, max: max };
  };

})();
