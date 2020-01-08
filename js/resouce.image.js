"use strict";
if (window.resouce === undefined) { window.resouce = {} }
if (window.resouce.image === undefined) { window.resouce.image = {} }

(function () {
  var _t = resouce.image;

  // 変数の初期化
  _t.imgs = {};

  // 画像の読み込み
  _t.load = function (nm, url) {
    var d = $.Deferred();

    var img = _t.imgs[nm] = new Image();
    img.onload = function () {
      var msg = "load img : " + nm;
      console.log(msg);
      d.resolve(msg);
    };
    img.src = url;

    return d.promise();
  };

})();

