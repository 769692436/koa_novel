layui.use(['form', 'upload'], function(){
  var form = layui.form;
  var upload = layui.upload;
  var $ = layui.$;
  var layer = layui.layer;


  var uploadInst = upload.render({
    elem: '#upload-cover',
    url: '/admin/book/add',
    data: {
      name: function(){
        return $('[name="name"]').val();
      },
      author: function(){
        return $('[name="author"]').val();
      },
      description: function(){
        return $('[name="description"]').val();
      },
      state: function(){
        return $('[name="state"]').val();
      },
      classification: function(){
        var temp  = [];
        $('[name="classification[]"]:checked').each(function(i, v){
          console.log(v);
          temp.push(v.value);
        });
        console.log(temp);
        return temp;
      }
    },
    auto: false,
    bindAction: '#btn-submit',
    choose: function(obj){
      var file = obj.pushFile();
      obj.preview(function(index, file, result){
        console.log(file);
      });
    },
    before: function(obj){
      console.log($('[name="classification[]"]'));
      layer.load();
    },
    done: function(res, index, upload){
      console.log(res);
      layer.closeAll('loading');
      switch(res.status) {
        case 'book_already_exists': {
          layer.msg('该小说已存在！');
          $('#btn-reset').click();
        };break;
        case 'read_cover_failed':{
          layer.msg('读取封面失败！');
          $('#btn-reset').click();
        };break;
        case 'save_cover_failed':{
          layer.msg('保存封面失败！');
          $('#btn-reset').click();
        };break;
        case 'book_save_error':{
          layer.msg('小说保存出错！');
          $('#btn-reset').click();
        };break;
        case 'book_save_success':{
          layer.msg('成功添加小说！');
          location.href = res.url;
        };break;
        default: layer.msg('服务器没有回应');
      }
    }
  });
});
