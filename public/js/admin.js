layui.use(['element', 'layer', 'upload', 'form'], function(){
  var element = layui.element;
  var layer = layui.layer;
  var upload = layui.upload;
  var form = layui.form;
  var $ = layui.$;

  var oUsername;

  //打开基本基本资料弹窗
  $('#btn-baseinfo').on('click', function(){
    var index = layer.open({
      title: '基本资料',
      type: 1,
      content: $('#admin-baseinfo') ,
    });
  });

  //修改个人头像
  var uploadInst = upload.render({
    elem: '#btn-modify-avatar',
    url: '/admin/avatar/modify',
    data: {
      oPath: $('#avatar').attr('src'),
      username: $('#admin-baseinfo [name="username"]').val()
    },
    before: function(obj){
      obj.preview(function(index, file, res){
        $('#avatar').attr('src', res);

      });
    },
    done: function(res){
      if(res.status > 0){
        return layer.msg('头像上传失败！');
      }else{
        layer.msg('头像修改成功！');
        setTimeout(function(){
          location.reload();
        }, 2000);
      }
    },
    error: function(){
      var uploadText = $('#upload-text');
      uploadText.html(`<span style='color: #ff5722;'>上传失败</span><a class='layui-btn layui-btn-xs avatar-reload'>重试</a>`);
      uploadText.find('.avatar-reload').on('click', function(){
        uploadInst.upload();
      })
    }
  });

  form.on('submit(uname)', function(data){
    $.ajax({
      url: '/admin/modify',
      method: 'post',
      data: {
        username: data.field.username,
        type: 0,
        userType: 0
      },
      success: function(res){
        console.log(res);
        if(parseInt(res.status) === 0){
          layer.msg('修改成功！');
          setTimeout(function(){
            location.reload();
          }, 2000);
        }else{
          layer.msg('修改失败！');
        }
      },
      error: function(){
        layer.msg('修改失败！');
      }
    })
  })


});
