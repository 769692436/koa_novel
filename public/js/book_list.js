layui.use(['table', 'form', 'upload'], function(){
  var table = layui.table,
      $ = layui.$,
      form = layui.form,
      upload = layui.upload;
  table.render({
    elem: '#book-list',
    url: '/admin/book/list',
    page: true,
    skin: 'line',
    cols: [[
      {type: 'checkbox'},
      {field: '_id', hide: 'true'},
      {field: 'cover', hide: 'true'},
      {field: 'description', hide: 'true'},
      {field: 'classification', hide: 'true'},
      {field: 'bookId', title: 'ID', width: 50},
      {field: 'name', title: '书名'},
      {field: 'author', title: '作者', width: 100},
      {field: 'state', title: '连载状态'},
      {field: 'currentLength', title: '最新章节数'},
      {title: '操作', toolbar: '#book-list-toolbar'}
    ]],
    parseData: function(res) {
      return {
        'code': res.status,
        'message': res.msg,
        'count': res.count,
        'data': res.data
      }
    }
  });
  table.on('tool(book-list)', function(obj) {
    var layEvent = obj.event;
    console.log(layEvent);
    switch(layEvent){
      case 'modify': modify($, form, obj.data); break;
      case 'catalog': {
        location.href= '/admin/book/section/listPage/' + obj.data._id;
      }; break;
      case 'del': del($, obj.data); break;
      case 'import': sectionImport(obj.data); break;
    }
  });

  function del($, data) {
    $.ajax({
      url: '/admin/book/del',
      type: 'post',
      data: data,
      beforeSend: function(xhr) {
        layer.load();
      },
      success: function(res){
        layer.msg(res.msg);
        setTimeout(function(){
          location.reload();
        }, 2000);
      },
      error: function(err) {
        console.log(err);
        layer.msg('删除失败!');
        setTimeout(function(){
          location.reload();
        }, 2000);
      }
    })
  }

  function modify($, form, data) {
    layer.open({
      type: 1,
      title: '小说基本信息',
      area: '600px',
      content: $('#modal-book-detail'),
      btn: ['取消'],
      btn1: function(index, layero) {
        layer.close(index);
      },
      success: function(layero, index) {
        var name = layero.find('[name=name]'),
            author = layero.find('[name=author]'),
            classification = layero.find('[name="classification[]"]'),
            description = layero.find('[name=description]'),
            state = layero.find('[name=state][value='+ data.state +']'),
            cover = layero.find('#cover'),
            mIndex = index;
        cover.attr('src',  data.cover);
        name.val(data.name);
        author.val(data.author);
        description.val(data.description);
        state.prop('checked', true);
        data.classification.forEach(function(i) {
          console.log(classification);
          classification.each(function(index, v){
            console.log(v.value);
            if(v.value == i){
              v.checked = true;
            }
          });
        });
        form.render();//更新表单
        //小说封面修改
        var uploadInst = upload.render({
          elem: '#btn-modify-cover',
          url: '/admin/book/cover/modify',
          data: {
            oPath: data.cover,
            _id: data._id,
            name: data.name
          },
          before: function(obj) {
            obj.preview(function(index, file, res) {
              $('#cover').attr('src', res);
            });
          },
          done: function(res) {
            if(res.status == 0){
              layer.msg(res.msg);
              setTimeout(function(){
                location.reload();
              }, 2000)
            }else{
              var uploadText = $('#modal-book-detail #upload-text');
              uploadText.html(`<span style='color: #ff5722;'>上传失败</span><a class='layui-btn layui-btn-xs cover-reload'>重试</a>`);
              uploadText.find('.cover-reload').on('click', function(){
                uploadInst.upload();
              });
            }
          },
          error: function(err) {
            var uploadText = $('#modal-book-detail #upload-text');
            uploadText.html(`<span style='color: #ff5722;'>上传失败</span><a class='layui-btn layui-btn-xs cover-reload'>重试</a>`);
            uploadText.find('.cover-reload').on('click', function(){
              uploadInst.upload();
            });
          }
        });//小说封面修改end
        //小说基本信息修改

        $('#btn-book-modify').on('click', function() {
          var classificationNew = [];
          $('[name="classification[]"]:checked').each(function(i, v){
            classificationNew.push(v.value);
          });
          layer.confirm('确认修改?', function(index) {
            var updateData = {
              _id: data._id,
              name: name.val(),
              author: author.val(),
              description: description.val(),
              state: $('[name=state]:checked').val(),
              classification: classificationNew
            }
            $.ajax({
              url: '/admin/book/modify',
              type: 'post',
              data: updateData,
              beforeSend: function(xhr) {
                layer.load();
              },
              success: function(res) {
                if(res.status == 0) {
                  layer.closeAll('loading');
                  layer.msg(res.msg);
                  setTimeout(function(){
                    location.reload();
                  }, 1500);
                }else{
                  layer.closeAll('loading');
                  layer.msg(res.msg);
                  setTimeout(function(){
                    location.reload();
                  }, 1500);
                }
              },
              error: function(err) {
                layer.msg('修改失败!');
                setTimeout(function(){
                  location.reload();
                }, 2000);
              }
            });//$.ajax end
            layer.close(index);
          });
        });//小说基本信息修改end
      }
    });
  }

  function sectionImport(data) {

    layer.open({
      type: 1,
      title: '导入整本小说',
      area: '800px',
      content: $('#modal-book-import'),
      btn: ['取消'],
      btn1: function(index, layero) {
        layer.close(index);
      },
      success: function(layero, index) {
        var book = $('[name=book]'),
            splitReg = $('[name=splitReg]'),
            titleReg = $('[name=titleReg]'),
            contentReg = $('[name=contentReg]');
        book.val(data.name);
        $('#upload-book-txt').on('click', function(){
          $('#select-book-txt').click();
        });
        form.on('submit(book-import)', function(data) {
          var fd = new FormData();
          console.log(data.field);
          for(i in data.field){
            console.log();
            fd.append(i, data.field[i]);
          }
          fd.append('file', $('#select-book-txt')[0].files[0]);
          $.ajax({
            url: '/admin/book/importBook',
            type: 'post',
            processData: false,
            contentType: false,
            data: fd,
            beforeSend: function(xhr) {
              layer.load();
            },
            success: function(res) {

            },
            error: function(err) {

            }
          })
        });
      }
    })
  }
});
