"use strict";
if (window.game === undefined) { window.game = {} }
if (window.game.anim === undefined) { window.game.anim = {} }

(function () {
  var _t = game.anim;

  // アニメーション実行/停止用関数
  _t.rqstAnmFrm = function (cb) {
    var id = (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function (cb) {
        return window.setTimeout(cb, 1000 / 60);
      })(cb);
    return id;
  };

  _t.cnclAnmFrm = function (id) {
    (window.cancelAnimationFrame ||
      window.webkitCancelRequestAnimationFrame ||
      window.mozCancelRequestAnimationFrame ||
      window.oCancelRequestAnimationFrame ||
      window.msCancelRequestAnimationFrame ||
      window.clearTimeout)(id)
  };

  // アニメーション用変数
  _t.anmId = null;
  _t.updtArr = [];	// 配列 {nm: 名前, fnc: 関数}
  _t.tm = { sum: 0, old: null, now: 0, dif: 0 };

  // アニメーションの開始
  _t.strt = function () {
    var anmFnc = function () {
      _t.updt();
      _t.anmId = _t.rqstAnmFrm(anmFnc);
    };
    anmFnc();
  };

  // アニメーションの更新
  _t.updt = function () {
    // 差分時間と経過時間を計算
    _t.tm.now = new Date();
    _t.tm.dif = _t.tm.old == null ? 0 : (_t.tm.now - _t.tm.old);
    _t.tm.sum += _t.tm.dif;
    _t.tm.old = _t.tm.now;

    // 更新配列を全て実行
    for (var i = 0; i < _t.updtArr.length; i++) {
      _t.updtArr[i].fnc(_t.tm);
    }
  };

  // アニメーションの追加
  _t.add = function (nm, fnc) {
    _t.updtArr.push({ nm: nm, fnc: fnc });
  };

  // アニメーションの削除
  _t.rmv = function (nm) {
    for (var i = _t.updtArr.length - 1; i >= 0; i--) {
      if (nm == _t.updtArr[i].nm) { _t.updtArr.splice(i, 1) }
    }
  };

})();
