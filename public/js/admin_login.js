layui.use(['form'], function(){
  var form = layui.form;
  var $ = layui.$;

  form.on('submit(login)', function(data){
    console.log(data.field);
    $.ajax({
      type: 'post',
      url: '/admin/login',
      data: data.field,
      success: function(res){
        console.log(res);
        switch (res.status) {
          case 'admin_not_exists':
            layer.msg('用户不存在');
            break;
          case 'password_err':
            layer.msg('密码错误');
            break;
          case 'login_err':
            layer.msg('登录失败');
            break;
          case 'login_success':
            layer.msg('成功登录！');
            setTimeout(function(){
              location.href = res.url;
            }, 1000);
            break;
          default: layer.msg('服务器没有响应');
        }
      }
    })
  })
});
