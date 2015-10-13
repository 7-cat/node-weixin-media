'use strict';
var assert = require('assert');
var validator = require('validator');
var media = require('../');
var fs = require("fs");
var path = require("path");

describe('node-weixin-media node module', function () {
  var app = {
    id: process.env.APP_ID,
    secret: process.env.APP_SECRET,
    token: process.env.APP_TOKEN
  };
  var auth = require("node-weixin-auth");
  var config = require("node-weixin-config");
  config.app.init(app);


  var mediaId = null, newsId = null;

  it('should be able to upload a temporary media', function (done) {
    var file = path.resolve(__dirname, "media/image.jpg");

    media.temporary.create(app, auth, 'image', file, function (error, json) {
      assert.equal(true, json.type === 'image');
      assert.equal(true, typeof json.media_id === 'string');
      mediaId = json.media_id;
      assert.equal(true, validator.isNumeric(json.created_at) && !!new Date(json.created_at));
      done();
    });
  });


  it('should be able to get a temporary media', function (done) {
    var file = path.resolve(__dirname, "output/temporary.jpg");
    media.temporary.get(app, auth, mediaId, file, function (error) {
      assert(!error);
      done();
    });
  });

  it('should be able to get a temporary media', function (done) {
    var file = path.resolve(__dirname, "output/temporary.jpg");
    if (fs.existsSync(file)) {
      fs.unlink(file);
    }
    media.temporary.get(app, auth, mediaId, file, function (error) {
      assert(!error);
      assert(fs.existsSync(file));
      done();
    });
  });


  it('should be able to upload a permanent media', function (done) {
    var file = path.resolve(__dirname, "media/image.jpg");
    media.permanent.create(app, auth, 'image', file, function (error, json) {
      assert.equal(true, typeof json.media_id === 'string');
      mediaId = json.media_id;
      assert.equal(true, validator.isURL(json.url));
      done();
    });
  });

  it('should be able to get a permanent media', function (done) {
    media.permanent.get(app, auth, mediaId, function (error, body) {
      var file = path.resolve(__dirname, "output/permanent.jpg");
      fs.writeFileSync(file, new Buffer(body));
      done();
    });
  });

  it('should be able to create a permanent news', function (done) {
    var json = {
      "articles": [{
        "title": 'hello',
        "thumb_media_id": mediaId,
        "author": 'author',
        "digest": 'digest',
        "show_cover_pic": 0,
        "content": 'content',
        "content_source_url": 'http://www.sina.com.cn'
      }]
    };
    media.permanent.news(app, auth, json, function (error, json) {
      newsId = json.media_id;
      assert.equal(true, !error);
      assert.equal(true, typeof json.media_id === 'string');
      done();
    });
  });


  it('should be able to update a permanent news', function (done) {
    var json =     {
      "media_id": newsId,
      "index": 0,
      "articles": {
        "title": 'hello1',
        "thumb_media_id": mediaId,
        "author": 'author2',
        "digest": 'digest1',
        "show_cover_pic": 0,
        "content": 'content1',
        "content_source_url": 'http://www.sina.com.cn'
      }
    };
    media.permanent.update(app, auth, json, function (error, data) {
      assert.equal(true, !error);
      assert.equal(true, data.errcode === 0);
      assert.equal(true, data.errmsg === 'ok');
      done();
    });
  });

  it('should be able to get media count', function (done) {
    media.count(app, auth, function (error, json) {
      assert.equal(true, validator.isNumeric(json.voice_count) && json.voice_count >= 0);
      assert.equal(true, validator.isNumeric(json.video_count) && json.video_count >= 0);
      assert.equal(true, validator.isNumeric(json.image_count) && json.image_count >= 0);
      assert.equal(true, validator.isNumeric(json.news_count) && json.news_count >= 0);
      done();
    });
  });

  it('should be able to get media list', function (done) {
    var type = 'image';   //Type of media
    var offset = 0;       //
    var limit = 5;        //Range from 1 ~ 20

    media.list(app, auth, type, limit, offset, function (error, json) {

      assert.equal(true, validator.isNumeric(json.total_count) && json.total_count >= 0);
      assert.equal(true, validator.isNumeric(json.item_count) && json.item_count >= 0);

      for (var i = 0; i < json.item.length; i++) {
        var item = json.item[i];
        assert.equal(true, item.media_id.length > 0);
      }
      done();
    });
  });

  it('should be able to remove a permanent news', function (done) {
    media.permanent.remove(app, auth, newsId, function (error, data) {
      assert.equal(true, !error);
      assert.equal(true, data.errcode === 0);
      assert.equal(true, data.errmsg === 'ok');
      done();
    });
  });
});