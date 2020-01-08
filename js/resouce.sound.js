"use strict";
if (window.resouce === undefined) { window.resouce = {} }
if (window.resouce.sound === undefined) { window.resouce.sound = {} }

(function () {
  var _t = resouce.sound;

  // 変数の初期化
  _t.canUse = null;	// 音声使用可能
  _t.canOgg = false;	// 音声可能ogg
  _t.canMp3 = false;	// 音声可能mp3
  _t.ext = "";		// 拡張子
  _t.timeout = 3000;	// タイムアウト

  _t.snds = {};
  _t.seMax = 8;		// SEの同時発音数
  _t.bgmNow = null;	// 現在のBGM

  var Sound = function () {
    this.audio = null;
    this.seNow = 0;
  };

  // 初期化
  _t.init = function () {
    if (_t.canUse != null) { return }

    try {
      // Audioが有効か否か
      var audio = new Audio("");
      _t.canOgg = audio.canPlayType("audio/ogg") == "maybe";
      _t.canMp3 = audio.canPlayType("audio/mpeg") == "maybe";
    } catch (e) { }
    _t.canUse = _t.canOgg || _t.canMp3;	// 音声使用可能
    _t.ext = _t.canOgg ? ".ogg" : (_t.canMp3 ? ".mp3" : "");	// 拡張子
    if (!game.core.ua.pc) { _t.canUse = false }	// モバイル時は不能
  };

  // 音声の読み込み
  _t.load = function (nm, url, type) {
    var d = $.Deferred();
    _t.init();

    // 使用不能の場合
    if (_t.canUse === false) {
      var msg = "cannot use snd : " + nm;
      console.log(msg);
      d.resolve(msg);
      return d.promise();
    }

    // 使用可能の場合
    if (type != "se") {
      // タイムアウト時の処理
      var id = setTimeout(function () {
        _t.snds[nm].audio = undefined;
        var msg = "timeout snd : " + nm;
        console.log(msg);
        d.resolve(msg);
      }, _t.timeout);

      _t.snds[nm] = new Sound();
      _t.snds[nm].audio = new Audio("");
      _t.snds[nm].audio.preload = "auto";
      _t.snds[nm].audio.src = url + _t.ext;

      // プレロード準備完了時の処理
      $(_t.snds[nm].audio).one("canplaythrough error", function (e) {
        if (e.type == "error") {
          _t.snds[nm].audio = undefined;
          var msg = "err snd : " + nm;
        } else {
          var msg = "load snd : " + nm;
        }
        console.log(msg);
        d.resolve(msg);
        clearTimeout(id);
      });
    } else {
      // SEの場合は複数読み込み
      _t.snds[nm] = new Sound();
      var arr = [];
      for (var i = 0; i < _t.seMax; i++) {
        arr.push(_t.load(nm + "-" + i, url));
      }
      $.when.apply($, arr).done(function () {
        d.resolve();
      });
    }
    return d.promise();
  };

  //------------------------------------------------------------

  // 無効確認
  _t.chckUnbl = function (nm) {
    if (_t.canUse === false) { return true }
    if (_t.snds[nm] === undefined) { return true }
    return false;
  };

  // 再生位置を0に
  _t.rstCurTm = function (au, cmd) {
    if (cmd) { au[cmd]() }	// 命令実行
    au.currentTime = 0;	// 再生位置を0に

    // currentTimeが利かない場合は読み込み直す
    if (au.currentTime != 0) { au.load() }
  };

  //------------------------------------------------------------

  // 再生
  _t.play = function (nm, cb) {
    if (_t.chckUnbl(nm)) { return }

    // 変数の初期化
    var au = _t.snds[nm].audio;

    // 巻き戻っていないなら巻き戻して再生
    if (au.currentTime >= au.duration) {
      _t.rstCurTm(au, "pause");	// 再生位置を0に
    }

    // ループなし
    if (typeof au.loop == "boolean") { au.loop = false }

    // コールバックの設定
    $(au).off("ended");
    if (typeof cb == "function") { $(au).on("ended", cb) }

    au.play();	// 再生
  };

  // ループ再生
  _t.playLoop = function (nm) {
    if (_t.chckUnbl(nm)) { return }

    // 変数の初期化
    var au = _t.snds[nm].audio;

    // 巻き戻っていないなら巻き戻して再生
    if (au.currentTime >= au.duration) {
      _t.rstCurTm(au, "pause");	// 再生位置を0に
    }

    // ループあり
    if (typeof au.loop == "boolean") {
      au.loop = true;
    } else {
      $(au).off("ended");
      $(au).on("ended", function () {
        _t.rstCurTm(au, "play");	// 再生位置を0に
      });
    }

    au.play();	// 再生
  };

  // 一時停止
  _t.pause = function (nm) {
    if (_t.chckUnbl(nm)) { return }

    _t.snds[nm].audio.pause();	// 一時停止
  };

  // 停止
  _t.stop = function (nm) {
    if (_t.chckUnbl(nm)) { return }

    // 変数の初期化
    var au = _t.snds[nm].audio;
    $(au).off("ended");
    _t.rstCurTm(au, "pause");	// 再生位置を0に
  };

  // ボリューム変更
  _t.vol = function (nm, vol) {
    if (_t.chckUnbl(nm)) { return }

    _t.snds[nm].audio.volume = vol;	// 0～1.0
  };

  //------------------------------------------------------------

  // SE再生
  _t.playSE = function (nm) {
    if (_t.chckUnbl(nm)) { return }

    var snd = _t.snds[nm];
    _t.play(nm + "-" + snd.seNow);	// 再生
    snd.seNow = (snd.seNow + 1) % _t.seMax;
  };

  // BGM再生
  _t.playBGM = function (nm, cb) {
    if (_t.chckUnbl(nm)) { return }

    if (nm != _t.bgmNow) { _t.stop(_t.bgmNow) }
    _t.bgmNow = nm;

    if (cb) { _t.play(nm, cb) }
    else { _t.playLoop(nm) }
  };

})();
