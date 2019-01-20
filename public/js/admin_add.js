layui.use(['form', 'upload'], function(){
  var form = layui.form;
  var upload = layui.upload;
  var $ = layui.$;
  form.verify({
    confirmPWD: function(value, item){
      var password = $('[name="password"]').val();
      if(value != password){
        return '两次输入密码不一致!';
      }
    },
  });
  var uploadInst = upload.render({
    elem: '#upload-avator',
    url: '/admin/add',
    data: {
      username: function() {
        return $('[name="username"]').val();
      },
      password: function() {
        return $('[name="password"]').val();
      }
    },
    auto: false,
    bindAction: '#btn-submit',
    choose: function(obj) {
      console.log(obj);
      var file = obj.pushFile();
      obj.preview(function(index, file, result) {
        console.log(file);
      })
    },
    before: function(obj) {
      layer.load();
    },
    done: function(res, index, upload){
      layer.closeAll('loading');
      console.log(res);
      switch (res.status) {
        case 'admin_exists': {
          layer.msg('用户名已存在');
          $('#btn-reset').click();
        };break;
        case 'upload_failed': {
          layer.msg('图片上传失败');
        };break;
        case 'admin_add_failed': {
          layer.msg('管理员添加失败');
          $('#reset').click();
        };break;
        case 'admin_add_success': {
          layer.msg('成功添加管理员');
          setTimeout(function(){
            location.href = res.url;
          },1500);
        };break;
        default: layer.msg('服务器没有回应');
      }
    }
  })
})
