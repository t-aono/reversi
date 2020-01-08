"use strict";
if (window.reversi === undefined) { window.reversi = {} }
if (window.reversi.core === undefined) { window.reversi.core = {} }

(function () {
  var _t = reversi.core;
  var _snd = resouce.sound;
  var _rvs = null;
  var _rc = null;
  var _re = null;

  // 初期化
  _t.init = function () {
    _rvs = reversi.reversi;
    _rc = reversi.canvas;
    _re = reversi.effect;

    var r = [];
    r.push(resouce.image.load("bg", "img/bg.png"));
    r.push(resouce.image.load("_tkn0", "img/token0.png"));
    r.push(resouce.image.load("_tkn1", "img/token1.png"));
    r.push(resouce.sound.load("se0", "snd/se0", "se"));
    r.push(resouce.sound.load("se1", "snd/se1", "se"));
    r.push(resouce.sound.load("bgm0", "snd/bgm0"));
    r.push(resouce.sound.load("win", "snd/win"));
    r.push(resouce.sound.load("lose", "snd/lose"));
    r.push(resouce.font.load("serif ", "ArchivoBlack, serif"));

    $.when.apply($, r).then(function () {
      _rc.initCnvs();		// キャンバスの初期化
      _rc.rszTkn();	  	// 石のリサイズ
      _re.init();			  // エフェクト初期化
      _t.initClck();		// クリック初期化
      _t.strt();			  // 開始
      game.anim.strt();	// アニメーション開始
      game.anim.add("updtCnvs", function () {
        _t.updtCnvs(false);		// キャンバス更新
      });
      game.ui.init(_rc.c, { fntFmly: "ArchivoBlack" });	// UI初期化

      // 開始表示
      _t.lck = true;		   	// クリックのロック
      _t.btnStrt("Start");	// 開始ボタン
    });
  };

  // クリック初期化
  _t.initClck = function () {
    var c = _rc.c;
    var l = _rc.l;
    var rng = game.core.inRng;

    $(c.cnvs).click(function (e) {
      var x = e.offsetX * game.canvas.scl;
      var y = e.offsetY * game.canvas.scl;

      // 盤面内か確認
      if (!rng(x, y, l.brdX, l.brdY, l.brdW, l.brdH)) { return }

      // 何マス目か計算
      var sqX = ((x - l.brdX) / l.sqSz) | 0;
      var sqY = ((y - l.brdY) / l.sqSz) | 0;
      _t.clckBrd(sqX, sqY);
    });
  };

  // 開始
  _t.strt = function () {
    _rvs.init();	      // 盤面初期化
    _t.updtCnvs(true);	// キャンバス更新
    _t.lck = false;		  // クリックのロック解除
  };

  // キャンバス更新
  _t.updtCnvs = function (needUpdt) {
    if (needUpdt) {
      // 再描画必要
      _rc.drwBg();				     // 背景描画
      _rc.drwSqAll();				   // 盤面全描画
      _rc.drwTknAll(_rvs.brd); // 全石描画
      _rc.drwEnblSqsAll();		 // 配置可能マスの全描画
      _rc.drwPScrAll();			   // 全スコア描画
      _rc.drwPlyr();				   // 手番プレイヤー描画
      _rc.genCsh();				     // キャッシュの作成
    } else {
      // 再描画不要（キャッシュ利用）
      _rc.drwCsh();				// キャッシュの描画
    }
  };

  // 開始ボタン
  _t.btnStrt = function (txt) {
    var nm = "btnStrt";
    var w = _rc.c.w;
    var h = _rc.c.h;
    var bW = _rc.l.sqSz * 4 * 1.2;
    var bH = _rc.l.sqSz * 1.3;
    var bX = (w - bW) / 2;
    var bY = (h - bH) / 2;

    game.ui.addBtn(nm, txt, bX, bY, bW, bH, function () {
      game.ui.rmvBtn(nm);
      _t.strt();	// Start
      _snd.playBGM("bgm0");
    });
  };

  // 盤面クリック時の処理
  _t.clckBrd = function (x, y) {
    // ロック時、COM時は飛ばす
    if (_t.lck) { return }
    if (_rvs.getPTyp() == _rvs.PTYP.com) { return }

    // 石置き処理
    var res = _rvs.putTkn(x, y);
    if (res) {
      _t.lck = true;	// ロック
      _t.doRev();		// 裏返し処理
    }
  };

  // 裏返し処理
  _t.doRev = function () {
    _snd.playSE("se0");
    _re.putTkn().then(function () {
      _t.playSERev();		// 裏返りSE
      return _re.chngBrd();
    }).then(function () {
      _t.updt();
    });
  };

  // 更新
  _t.updt = function () {
    _t.updtCnvs(true);	// キャンバス更新

    // 終了判定
    if (_rvs.isEnd) {
      // 結果計算
      var msg = "LOSE", bgm = "lose";
      if (_rvs.scr[0] > _rvs.scr[1]) { msg = "WIN"; bgm = "win" }
      if (_rvs.scr[0] == _rvs.scr[1]) { msg = "DRAW" }

      // エフェクト
      _re.msg("END").then(function () {
        // 終了時サウンド
        _snd.playBGM(bgm, function () {
          _snd.playBGM("bgm1");
          _t.btnStrt("Start");	// 開始ボタン
        });
        _re.msg(msg);
      });
      return;
    }

    // スキップが必要か確認
    if (_rvs.enblSqs.length == 0) {
      _re.msg("SKIP").then(function () {
        _rvs.skp();
        _t.updt();
      });
      return;
    }

    // COMか確認
    if (_rvs.getPTyp() == _rvs.PTYP.com) {
      setTimeout(function () {
        // 石置き処理
        var put = reversi.com.get();
        _rvs.putTkn(put.x, put.y);
        _t.doRev();		// 裏返し処理
      }, 250);
      return;
    }

    // スキップやCOMがなければロック解除
    _t.lck = false;
  };

  // 裏返しSE
  _t.playSERev = function () {
    var max = _rvs.revTkns.length;
    if (max > _snd.seMax) { max = _snd.seMax }
    for (var i = 0; i < max; i++) {
      setTimeout(function () {
        _snd.playSE("se1");
      }, 50 * i);
    }
  };


})();
