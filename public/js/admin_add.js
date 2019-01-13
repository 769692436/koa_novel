layui.use('form', function(){
  var form = layui.form;
  var $ = layui.$;
  form.verify({
    confirmPWD: function(value, item){
      var password = $([name='password']).value;
      console.log(password);
      if(value != password){
        return '两次输入密码不一致!';
      }
    },
  })
})
