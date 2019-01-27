layui.use(['form'], function(){
  var form = layui.form,
      $ = layui.$;

  form.on('submit', function(data){
    console.log(123);
    $.ajax({
      url: '/admin/book/rule/add',
      type: 'post',
      data: data.field,
      success: function(res){
        if(res.status === 'save_rule_success'){
          layer.msg('添加成功！');
          setTimeout(function(){
            location.href = '/admin/book/rule/listPage';
          }, 2000);
        }else{
          layer.msg('添加失败！');
          $('#btn-reset').click();
        }
      },
      error: function(err){
        layer.msg('服务器无响应！');
      }
    })
  });

});
