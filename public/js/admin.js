layui.use(['element', 'layer', 'upload', 'form'], function(){
  var element = layui.element;
  var layer = layui.layer;
  var $ = layui.$;
  $('#btn-baseinfo').on('click', function(e){
    console.log(123);
    layer.open({
      title: '基本资料',
      type: 1,
      content: $('#admin-baseinfo') ,
    });
  });


});
