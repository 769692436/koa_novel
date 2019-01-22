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
        $('[name="classification[]"]').each(function(i, v){
          console.log(v);
          temp.push(v.value);
        });
        // console.log(temp);
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
    }
  });
});
