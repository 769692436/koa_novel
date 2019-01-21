layui.use(['form', 'upload'], function(){
  var form = layui.form;
  var upload = layui.upload;
  var $ = layui.$;
  var layer = layui.layer;


  var uploadInst = upload.render({
    elem: '#upload-cover',
    url: '/admin/book/add'
  });
});
