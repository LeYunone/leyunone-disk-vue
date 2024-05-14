import { ref, inject, onMounted, nextTick, withDirectives, openBlock, createElementBlock, renderSlot, vShow, onBeforeUnmount, normalizeClass, getCurrentInstance, computed, watch, onUnmounted, createElementVNode, normalizeStyle, createTextVNode, toDisplayString, toRaw, resolveComponent, Fragment, renderList, createVNode, provide, withCtx } from "vue";
function commonjsRequire(path) {
  throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var uploader$1 = { exports: {} };
/*!
 * Uploader - Uploader library implements html5 file upload and provides multiple simultaneous, stable, fault tolerant and resumable uploads
 * @version v0.6.0
 * @author dolymood <dolymood@gmail.com>
 * @link https://github.com/simple-uploader/Uploader
 * @license MIT
 */
(function(module, exports) {
  !function(e) {
    module.exports = e();
  }(function() {
    return function e(t, n, r) {
      function s(o2, u) {
        if (!n[o2]) {
          if (!t[o2]) {
            var a = typeof commonjsRequire == "function" && commonjsRequire;
            if (!u && a)
              return a(o2, true);
            if (i)
              return i(o2, true);
            throw new Error("Cannot find module '" + o2 + "'");
          }
          var f = n[o2] = { exports: {} };
          t[o2][0].call(f.exports, function(e2) {
            var n2 = t[o2][1][e2];
            return s(n2 ? n2 : e2);
          }, f, f.exports, e, t, n, r);
        }
        return n[o2].exports;
      }
      var i = typeof commonjsRequire == "function" && commonjsRequire;
      for (var o = 0; o < r.length; o++)
        s(r[o]);
      return s;
    }({ 1: [function(_dereq_, module2, exports2) {
      var utils = _dereq_("./utils");
      function Chunk(uploader2, file, offset) {
        utils.defineNonEnumerable(this, "uploader", uploader2);
        utils.defineNonEnumerable(this, "file", file);
        utils.defineNonEnumerable(this, "bytes", null);
        this.offset = offset;
        this.tested = false;
        this.retries = 0;
        this.pendingRetry = false;
        this.preprocessState = 0;
        this.readState = 0;
        this.loaded = 0;
        this.total = 0;
        this.chunkSize = utils.evalOpts(uploader2.opts.chunkSize, file, this);
        this.startByte = this.offset * this.chunkSize;
        this.endByte = this.computeEndByte();
        this.xhr = null;
      }
      var STATUS = Chunk.STATUS = {
        PENDING: "pending",
        UPLOADING: "uploading",
        READING: "reading",
        SUCCESS: "success",
        ERROR: "error",
        COMPLETE: "complete",
        PROGRESS: "progress",
        RETRY: "retry"
      };
      utils.extend(Chunk.prototype, {
        _event: function(evt, args) {
          args = utils.toArray(arguments);
          args.unshift(this);
          this.file._chunkEvent.apply(this.file, args);
        },
        computeEndByte: function() {
          var endByte = Math.min(this.file.size, (this.offset + 1) * this.chunkSize);
          if (this.file.size - endByte < this.chunkSize && !this.uploader.opts.forceChunkSize) {
            endByte = this.file.size;
          }
          return endByte;
        },
        getParams: function() {
          return {
            chunkNumber: this.offset + 1,
            chunkSize: this.chunkSize,
            currentChunkSize: this.endByte - this.startByte,
            totalSize: this.file.size,
            identifier: this.file.uniqueIdentifier,
            filename: this.file.name,
            relativePath: this.file.relativePath,
            totalChunks: this.file.chunks.length
          };
        },
        getTarget: function(target, params) {
          if (!params.length) {
            return target;
          }
          if (target.indexOf("?") < 0) {
            target += "?";
          } else {
            target += "&";
          }
          return target + params.join("&");
        },
        test: function() {
          this.xhr = new XMLHttpRequest();
          this.xhr.addEventListener("load", testHandler, false);
          this.xhr.addEventListener("error", testHandler, false);
          var testMethod = utils.evalOpts(this.uploader.opts.testMethod, this.file, this);
          var data = this.prepareXhrRequest(testMethod, true);
          this.xhr.send(data);
          var $ = this;
          function testHandler(event) {
            var status = $.status(true);
            if (status === STATUS.ERROR) {
              $._event(status, $.message());
              $.uploader.uploadNextChunk();
            } else if (status === STATUS.SUCCESS) {
              $._event(status, $.message());
              $.tested = true;
            } else if (!$.file.paused) {
              $.tested = true;
              $.send();
            }
          }
        },
        preprocessFinished: function() {
          this.endByte = this.computeEndByte();
          this.preprocessState = 2;
          this.send();
        },
        readFinished: function(bytes) {
          this.readState = 2;
          this.bytes = bytes;
          this.send();
        },
        send: function() {
          var preprocess = this.uploader.opts.preprocess;
          var read = this.uploader.opts.readFileFn;
          if (utils.isFunction(preprocess)) {
            switch (this.preprocessState) {
              case 0:
                this.preprocessState = 1;
                preprocess(this);
                return;
              case 1:
                return;
            }
          }
          switch (this.readState) {
            case 0:
              this.readState = 1;
              read(this.file, this.file.fileType, this.startByte, this.endByte, this);
              return;
            case 1:
              return;
          }
          if (this.uploader.opts.testChunks && !this.tested) {
            this.test();
            return;
          }
          this.loaded = 0;
          this.total = 0;
          this.pendingRetry = false;
          this.xhr = new XMLHttpRequest();
          this.xhr.upload.addEventListener("progress", progressHandler, false);
          this.xhr.addEventListener("load", doneHandler, false);
          this.xhr.addEventListener("error", doneHandler, false);
          var uploadMethod = utils.evalOpts(this.uploader.opts.uploadMethod, this.file, this);
          var data = this.prepareXhrRequest(uploadMethod, false, this.uploader.opts.method, this.bytes);
          this.xhr.send(data);
          var $ = this;
          function progressHandler(event) {
            if (event.lengthComputable) {
              $.loaded = event.loaded;
              $.total = event.total;
            }
            $._event(STATUS.PROGRESS, event);
          }
          function doneHandler(event) {
            var msg = $.message();
            $.processingResponse = true;
            $.uploader.opts.processResponse(msg, function(err, res) {
              $.processingResponse = false;
              if (!$.xhr) {
                return;
              }
              $.processedState = {
                err,
                res
              };
              var status = $.status();
              if (status === STATUS.SUCCESS || status === STATUS.ERROR) {
                $._event(status, res);
                status === STATUS.ERROR && $.uploader.uploadNextChunk();
              } else {
                $._event(STATUS.RETRY, res);
                $.pendingRetry = true;
                $.abort();
                $.retries++;
                var retryInterval = $.uploader.opts.chunkRetryInterval;
                if (retryInterval !== null) {
                  setTimeout(function() {
                    $.send();
                  }, retryInterval);
                } else {
                  $.send();
                }
              }
            }, $.file, $);
          }
        },
        abort: function() {
          var xhr = this.xhr;
          this.xhr = null;
          this.processingResponse = false;
          this.processedState = null;
          if (xhr) {
            xhr.abort();
          }
        },
        status: function(isTest) {
          if (this.readState === 1) {
            return STATUS.READING;
          } else if (this.pendingRetry || this.preprocessState === 1) {
            return STATUS.UPLOADING;
          } else if (!this.xhr) {
            return STATUS.PENDING;
          } else if (this.xhr.readyState < 4 || this.processingResponse) {
            return STATUS.UPLOADING;
          } else {
            var _status;
            if (this.uploader.opts.successStatuses.indexOf(this.xhr.status) > -1) {
              _status = STATUS.SUCCESS;
            } else if (this.uploader.opts.permanentErrors.indexOf(this.xhr.status) > -1 || !isTest && this.retries >= this.uploader.opts.maxChunkRetries) {
              _status = STATUS.ERROR;
            } else {
              this.abort();
              _status = STATUS.PENDING;
            }
            var processedState = this.processedState;
            if (processedState && processedState.err) {
              _status = STATUS.ERROR;
            }
            return _status;
          }
        },
        message: function() {
          return this.xhr ? this.xhr.responseText : "";
        },
        progress: function() {
          if (this.pendingRetry) {
            return 0;
          }
          var s = this.status();
          if (s === STATUS.SUCCESS || s === STATUS.ERROR) {
            return 1;
          } else if (s === STATUS.PENDING) {
            return 0;
          } else {
            return this.total > 0 ? this.loaded / this.total : 0;
          }
        },
        sizeUploaded: function() {
          var size = this.endByte - this.startByte;
          if (this.status() !== STATUS.SUCCESS) {
            size = this.progress() * size;
          }
          return size;
        },
        prepareXhrRequest: function(method, isTest, paramsMethod, blob) {
          var query = utils.evalOpts(this.uploader.opts.query, this.file, this, isTest);
          query = utils.extend(this.getParams(), query);
          query = this.uploader.opts.processParams(query, this.file, this, isTest);
          var target = utils.evalOpts(this.uploader.opts.target, this.file, this, isTest);
          var data = null;
          if (method === "GET" || paramsMethod === "octet") {
            var params = [];
            utils.each(query, function(v, k) {
              params.push([encodeURIComponent(k), encodeURIComponent(v)].join("="));
            });
            target = this.getTarget(target, params);
            data = blob || null;
          } else {
            data = new FormData();
            utils.each(query, function(v, k) {
              data.append(k, v);
            });
            if (typeof blob !== "undefined") {
              data.append(this.uploader.opts.fileParameterName, blob, this.file.name);
            }
          }
          this.xhr.open(method, target, true);
          this.xhr.withCredentials = this.uploader.opts.withCredentials;
          utils.each(utils.evalOpts(this.uploader.opts.headers, this.file, this, isTest), function(v, k) {
            this.xhr.setRequestHeader(k, v);
          }, this);
          return data;
        }
      });
      module2.exports = Chunk;
    }, { "./utils": 5 }], 2: [function(_dereq_, module2, exports2) {
      var each = _dereq_("./utils").each;
      var event = {
        _eventData: null,
        on: function(name, func) {
          if (!this._eventData)
            this._eventData = {};
          if (!this._eventData[name])
            this._eventData[name] = [];
          var listened = false;
          each(this._eventData[name], function(fuc) {
            if (fuc === func) {
              listened = true;
              return false;
            }
          });
          if (!listened) {
            this._eventData[name].push(func);
          }
        },
        off: function(name, func) {
          if (!this._eventData)
            this._eventData = {};
          if (!this._eventData[name] || !this._eventData[name].length)
            return;
          if (func) {
            each(this._eventData[name], function(fuc, i) {
              if (fuc === func) {
                this._eventData[name].splice(i, 1);
                return false;
              }
            }, this);
          } else {
            this._eventData[name] = [];
          }
        },
        trigger: function(name) {
          if (!this._eventData)
            this._eventData = {};
          if (!this._eventData[name])
            return true;
          var args = this._eventData[name].slice.call(arguments, 1);
          var preventDefault = false;
          each(this._eventData[name], function(fuc) {
            preventDefault = fuc.apply(this, args) === false || preventDefault;
          }, this);
          return !preventDefault;
        }
      };
      module2.exports = event;
    }, { "./utils": 5 }], 3: [function(_dereq_, module2, exports2) {
      var utils = _dereq_("./utils");
      var event = _dereq_("./event");
      var File = _dereq_("./file");
      var Chunk = _dereq_("./chunk");
      var version = "0.6.0";
      var isServer = typeof window === "undefined";
      var ie10plus = isServer ? false : window.navigator.msPointerEnabled;
      var support = function() {
        if (isServer) {
          return false;
        }
        var sliceName = "slice";
        var _support = utils.isDefined(window.File) && utils.isDefined(window.Blob) && utils.isDefined(window.FileList);
        var bproto = null;
        if (_support) {
          bproto = window.Blob.prototype;
          utils.each(["slice", "webkitSlice", "mozSlice"], function(n) {
            if (bproto[n]) {
              sliceName = n;
              return false;
            }
          });
          _support = !!bproto[sliceName];
        }
        if (_support)
          Uploader2.sliceName = sliceName;
        bproto = null;
        return _support;
      }();
      var supportDirectory = function() {
        if (isServer) {
          return false;
        }
        var input = window.document.createElement("input");
        input.type = "file";
        var sd = "webkitdirectory" in input || "directory" in input;
        input = null;
        return sd;
      }();
      function Uploader2(opts) {
        this.support = support;
        if (!this.support) {
          return;
        }
        this.supportDirectory = supportDirectory;
        utils.defineNonEnumerable(this, "filePaths", {});
        this.opts = utils.extend({}, Uploader2.defaults, opts || {});
        this.preventEvent = utils.bind(this._preventEvent, this);
        File.call(this, this);
      }
      var webAPIFileRead = function(fileObj, fileType, startByte, endByte, chunk) {
        chunk.readFinished(fileObj.file[Uploader2.sliceName](startByte, endByte, fileType));
      };
      Uploader2.version = version;
      Uploader2.defaults = {
        chunkSize: 1024 * 1024,
        forceChunkSize: false,
        simultaneousUploads: 3,
        singleFile: false,
        fileParameterName: "file",
        progressCallbacksInterval: 500,
        speedSmoothingFactor: 0.1,
        query: {},
        headers: {},
        withCredentials: false,
        preprocess: null,
        method: "multipart",
        testMethod: "GET",
        uploadMethod: "POST",
        prioritizeFirstAndLastChunk: false,
        allowDuplicateUploads: false,
        target: "/",
        testChunks: true,
        generateUniqueIdentifier: null,
        maxChunkRetries: 0,
        chunkRetryInterval: null,
        permanentErrors: [404, 415, 500, 501],
        successStatuses: [200, 201, 202],
        onDropStopPropagation: false,
        initFileFn: null,
        readFileFn: webAPIFileRead,
        checkChunkUploadedByResponse: null,
        initialPaused: false,
        processResponse: function(response, cb) {
          cb(null, response);
        },
        processParams: function(params) {
          return params;
        }
      };
      Uploader2.utils = utils;
      Uploader2.event = event;
      Uploader2.File = File;
      Uploader2.Chunk = Chunk;
      Uploader2.prototype = utils.extend({}, File.prototype);
      utils.extend(Uploader2.prototype, event);
      utils.extend(Uploader2.prototype, {
        constructor: Uploader2,
        _trigger: function(name) {
          var args = utils.toArray(arguments);
          var preventDefault = !this.trigger.apply(this, arguments);
          if (name !== "catchAll") {
            args.unshift("catchAll");
            preventDefault = !this.trigger.apply(this, args) || preventDefault;
          }
          return !preventDefault;
        },
        _triggerAsync: function() {
          var args = arguments;
          utils.nextTick(function() {
            this._trigger.apply(this, args);
          }, this);
        },
        addFiles: function(files, evt) {
          var _files = [];
          var oldFileListLen = this.fileList.length;
          utils.each(files, function(file) {
            if ((!ie10plus || ie10plus && file.size > 0) && !(file.size % 4096 === 0 && (file.name === "." || file.fileName === "."))) {
              var uniqueIdentifier = this.generateUniqueIdentifier(file);
              if (this.opts.allowDuplicateUploads || !this.getFromUniqueIdentifier(uniqueIdentifier)) {
                var _file = new File(this, file, this);
                _file.uniqueIdentifier = uniqueIdentifier;
                if (this._trigger("fileAdded", _file, evt)) {
                  _files.push(_file);
                } else {
                  File.prototype.removeFile.call(this, _file);
                }
              }
            }
          }, this);
          var newFileList = this.fileList.slice(oldFileListLen);
          if (this._trigger("filesAdded", _files, newFileList, evt)) {
            utils.each(_files, function(file) {
              if (this.opts.singleFile && this.files.length > 0) {
                this.removeFile(this.files[0]);
              }
              this.files.push(file);
            }, this);
            this._trigger("filesSubmitted", _files, newFileList, evt);
          } else {
            utils.each(newFileList, function(file) {
              File.prototype.removeFile.call(this, file);
            }, this);
          }
        },
        addFile: function(file, evt) {
          this.addFiles([file], evt);
        },
        cancel: function() {
          for (var i = this.fileList.length - 1; i >= 0; i--) {
            this.fileList[i].cancel();
          }
        },
        removeFile: function(file) {
          File.prototype.removeFile.call(this, file);
          this._trigger("fileRemoved", file);
        },
        generateUniqueIdentifier: function(file) {
          var custom = this.opts.generateUniqueIdentifier;
          if (utils.isFunction(custom)) {
            return custom(file);
          }
          var relativePath = file.relativePath || file.webkitRelativePath || file.fileName || file.name;
          return file.size + "-" + relativePath.replace(/[^0-9a-zA-Z_-]/img, "");
        },
        getFromUniqueIdentifier: function(uniqueIdentifier) {
          var ret = false;
          utils.each(this.files, function(file) {
            if (file.uniqueIdentifier === uniqueIdentifier) {
              ret = file;
              return false;
            }
          });
          return ret;
        },
        uploadNextChunk: function(preventEvents) {
          var found = false;
          var pendingStatus = Chunk.STATUS.PENDING;
          var checkChunkUploaded = this.uploader.opts.checkChunkUploadedByResponse;
          if (this.opts.prioritizeFirstAndLastChunk) {
            utils.each(this.files, function(file) {
              if (file.paused) {
                return;
              }
              if (checkChunkUploaded && !file._firstResponse && file.isUploading()) {
                return;
              }
              if (file.chunks.length && file.chunks[0].status() === pendingStatus) {
                file.chunks[0].send();
                found = true;
                return false;
              }
              if (file.chunks.length > 1 && file.chunks[file.chunks.length - 1].status() === pendingStatus) {
                file.chunks[file.chunks.length - 1].send();
                found = true;
                return false;
              }
            });
            if (found) {
              return found;
            }
          }
          utils.each(this.files, function(file) {
            if (!file.paused) {
              if (checkChunkUploaded && !file._firstResponse && file.isUploading()) {
                return;
              }
              utils.each(file.chunks, function(chunk) {
                if (chunk.status() === pendingStatus) {
                  chunk.send();
                  found = true;
                  return false;
                }
              });
            }
            if (found) {
              return false;
            }
          });
          if (found) {
            return true;
          }
          var outstanding = false;
          utils.each(this.files, function(file) {
            if (!file.isComplete()) {
              outstanding = true;
              return false;
            }
          });
          if (!outstanding && !preventEvents && this.files.length) {
            this._triggerAsync("complete");
          }
          return outstanding;
        },
        upload: function(preventEvents) {
          var ret = this._shouldUploadNext();
          if (ret === false) {
            return;
          }
          !preventEvents && this._trigger("uploadStart");
          var started = false;
          for (var num = 1; num <= this.opts.simultaneousUploads - ret; num++) {
            started = this.uploadNextChunk(!preventEvents) || started;
            if (!started && preventEvents) {
              break;
            }
          }
          if (!started && !preventEvents) {
            this._triggerAsync("complete");
          }
        },
        _shouldUploadNext: function() {
          var num = 0;
          var should = true;
          var simultaneousUploads = this.opts.simultaneousUploads;
          var uploadingStatus = Chunk.STATUS.UPLOADING;
          utils.each(this.files, function(file) {
            utils.each(file.chunks, function(chunk) {
              if (chunk.status() === uploadingStatus) {
                num++;
                if (num >= simultaneousUploads) {
                  should = false;
                  return false;
                }
              }
            });
            return should;
          });
          return should && num;
        },
        assignBrowse: function(domNodes, isDirectory, singleFile, attributes) {
          if (typeof domNodes.length === "undefined") {
            domNodes = [domNodes];
          }
          utils.each(domNodes, function(domNode) {
            var input;
            if (domNode.tagName === "INPUT" && domNode.type === "file") {
              input = domNode;
            } else {
              input = document.createElement("input");
              input.setAttribute("type", "file");
              utils.extend(input.style, {
                visibility: "hidden",
                position: "absolute",
                width: "1px",
                height: "1px"
              });
              domNode.appendChild(input);
              domNode.addEventListener("click", function(e) {
                if (domNode.tagName.toLowerCase() === "label") {
                  return;
                }
                input.click();
              }, false);
            }
            if (!this.opts.singleFile && !singleFile) {
              input.setAttribute("multiple", "multiple");
            }
            if (isDirectory) {
              input.setAttribute("webkitdirectory", "webkitdirectory");
            }
            attributes && utils.each(attributes, function(value, key) {
              input.setAttribute(key, value);
            });
            var that = this;
            input.addEventListener("change", function(e) {
              that._trigger(e.type, e);
              if (e.target.value) {
                that.addFiles(e.target.files, e);
                e.target.value = "";
              }
            }, false);
          }, this);
        },
        onDrop: function(evt) {
          this._trigger(evt.type, evt);
          if (this.opts.onDropStopPropagation) {
            evt.stopPropagation();
          }
          evt.preventDefault();
          this._parseDataTransfer(evt.dataTransfer, evt);
        },
        _parseDataTransfer: function(dataTransfer, evt) {
          if (dataTransfer.items && dataTransfer.items[0] && dataTransfer.items[0].webkitGetAsEntry) {
            this.webkitReadDataTransfer(dataTransfer, evt);
          } else {
            this.addFiles(dataTransfer.files, evt);
          }
        },
        webkitReadDataTransfer: function(dataTransfer, evt) {
          var self = this;
          var queue = dataTransfer.items.length;
          var files = [];
          utils.each(dataTransfer.items, function(item) {
            var entry = item.webkitGetAsEntry();
            if (!entry) {
              decrement();
              return;
            }
            if (entry.isFile) {
              fileReadSuccess(item.getAsFile(), entry.fullPath);
            } else {
              readDirectory(entry.createReader());
            }
          });
          function readDirectory(reader) {
            reader.readEntries(function(entries) {
              if (entries.length) {
                queue += entries.length;
                utils.each(entries, function(entry) {
                  if (entry.isFile) {
                    var fullPath = entry.fullPath;
                    entry.file(function(file) {
                      fileReadSuccess(file, fullPath);
                    }, readError);
                  } else if (entry.isDirectory) {
                    readDirectory(entry.createReader());
                  }
                });
                readDirectory(reader);
              } else {
                decrement();
              }
            }, readError);
          }
          function fileReadSuccess(file, fullPath) {
            file.relativePath = fullPath.substring(1);
            files.push(file);
            decrement();
          }
          function readError(fileError) {
            throw fileError;
          }
          function decrement() {
            if (--queue === 0) {
              self.addFiles(files, evt);
            }
          }
        },
        _assignHelper: function(domNodes, handles, remove) {
          if (typeof domNodes.length === "undefined") {
            domNodes = [domNodes];
          }
          var evtMethod = remove ? "removeEventListener" : "addEventListener";
          utils.each(domNodes, function(domNode) {
            utils.each(handles, function(handler, name) {
              domNode[evtMethod](name, handler, false);
            }, this);
          }, this);
        },
        _preventEvent: function(e) {
          utils.preventEvent(e);
          this._trigger(e.type, e);
        },
        assignDrop: function(domNodes) {
          this._onDrop = utils.bind(this.onDrop, this);
          this._assignHelper(domNodes, {
            dragover: this.preventEvent,
            dragenter: this.preventEvent,
            dragleave: this.preventEvent,
            drop: this._onDrop
          });
        },
        unAssignDrop: function(domNodes) {
          this._assignHelper(domNodes, {
            dragover: this.preventEvent,
            dragenter: this.preventEvent,
            dragleave: this.preventEvent,
            drop: this._onDrop
          }, true);
          this._onDrop = null;
        }
      });
      module2.exports = Uploader2;
    }, { "./chunk": 1, "./event": 2, "./file": 4, "./utils": 5 }], 4: [function(_dereq_, module2, exports2) {
      var utils = _dereq_("./utils");
      var Chunk = _dereq_("./chunk");
      function File(uploader2, file, parent) {
        utils.defineNonEnumerable(this, "uploader", uploader2);
        this.isRoot = this.isFolder = uploader2 === this;
        utils.defineNonEnumerable(this, "parent", parent || null);
        utils.defineNonEnumerable(this, "files", []);
        utils.defineNonEnumerable(this, "fileList", []);
        utils.defineNonEnumerable(this, "chunks", []);
        utils.defineNonEnumerable(this, "_errorFiles", []);
        utils.defineNonEnumerable(this, "file", null);
        this.id = utils.uid();
        if (this.isRoot || !file) {
          this.file = null;
        } else {
          if (utils.isString(file)) {
            this.isFolder = true;
            this.file = null;
            this.path = file;
            if (this.parent.path) {
              file = file.substr(this.parent.path.length);
            }
            this.name = file.charAt(file.length - 1) === "/" ? file.substr(0, file.length - 1) : file;
          } else {
            this.file = file;
            this.fileType = this.file.type;
            this.name = file.fileName || file.name;
            this.size = file.size;
            this.relativePath = file.relativePath || file.webkitRelativePath || this.name;
            this._parseFile();
          }
        }
        this.paused = uploader2.opts.initialPaused;
        this.error = false;
        this.allError = false;
        this.aborted = false;
        this.completed = false;
        this.averageSpeed = 0;
        this.currentSpeed = 0;
        this._lastProgressCallback = Date.now();
        this._prevUploadedSize = 0;
        this._prevProgress = 0;
        this.bootstrap();
      }
      utils.extend(File.prototype, {
        _parseFile: function() {
          var ppaths = parsePaths(this.relativePath);
          if (ppaths.length) {
            var filePaths = this.uploader.filePaths;
            utils.each(ppaths, function(path, i) {
              var folderFile = filePaths[path];
              if (!folderFile) {
                folderFile = new File(this.uploader, path, this.parent);
                filePaths[path] = folderFile;
                this._updateParentFileList(folderFile);
              }
              this.parent = folderFile;
              folderFile.files.push(this);
              if (!ppaths[i + 1]) {
                folderFile.fileList.push(this);
              }
            }, this);
          } else {
            this._updateParentFileList();
          }
        },
        _updateParentFileList: function(file) {
          if (!file) {
            file = this;
          }
          var p = this.parent;
          if (p) {
            p.fileList.push(file);
          }
        },
        _eachAccess: function(eachFn, fileFn) {
          if (this.isFolder) {
            utils.each(this.files, function(f, i) {
              return eachFn.call(this, f, i);
            }, this);
            return;
          }
          fileFn.call(this, this);
        },
        bootstrap: function() {
          if (this.isFolder)
            return;
          var opts = this.uploader.opts;
          if (utils.isFunction(opts.initFileFn)) {
            opts.initFileFn.call(this, this);
          }
          this.abort(true);
          this._resetError();
          this._prevProgress = 0;
          var round = opts.forceChunkSize ? Math.ceil : Math.floor;
          var chunks = Math.max(round(this.size / opts.chunkSize), 1);
          for (var offset = 0; offset < chunks; offset++) {
            this.chunks.push(new Chunk(this.uploader, this, offset));
          }
        },
        _measureSpeed: function() {
          var smoothingFactor = this.uploader.opts.speedSmoothingFactor;
          var timeSpan = Date.now() - this._lastProgressCallback;
          if (!timeSpan) {
            return;
          }
          var uploaded = this.sizeUploaded();
          this.currentSpeed = Math.max((uploaded - this._prevUploadedSize) / timeSpan * 1e3, 0);
          this.averageSpeed = smoothingFactor * this.currentSpeed + (1 - smoothingFactor) * this.averageSpeed;
          this._prevUploadedSize = uploaded;
          if (this.parent && this.parent._checkProgress()) {
            this.parent._measureSpeed();
          }
        },
        _checkProgress: function(file) {
          return Date.now() - this._lastProgressCallback >= this.uploader.opts.progressCallbacksInterval;
        },
        _chunkEvent: function(chunk, evt, message) {
          var uploader2 = this.uploader;
          var STATUS = Chunk.STATUS;
          var that = this;
          var rootFile = this.getRoot();
          var triggerProgress = function() {
            that._measureSpeed();
            uploader2._trigger("fileProgress", rootFile, that, chunk);
            that._lastProgressCallback = Date.now();
          };
          switch (evt) {
            case STATUS.PROGRESS:
              if (this._checkProgress()) {
                triggerProgress();
              }
              break;
            case STATUS.ERROR:
              this._error();
              this.abort(true);
              uploader2._trigger("fileError", rootFile, this, message, chunk);
              break;
            case STATUS.SUCCESS:
              this._updateUploadedChunks(message, chunk);
              if (this.error) {
                return;
              }
              clearTimeout(this._progeressId);
              this._progeressId = 0;
              var timeDiff = Date.now() - this._lastProgressCallback;
              if (timeDiff < uploader2.opts.progressCallbacksInterval) {
                this._progeressId = setTimeout(triggerProgress, uploader2.opts.progressCallbacksInterval - timeDiff);
              }
              if (this.isComplete()) {
                clearTimeout(this._progeressId);
                triggerProgress();
                this.currentSpeed = 0;
                this.averageSpeed = 0;
                uploader2._trigger("fileSuccess", rootFile, this, message, chunk);
                if (rootFile.isComplete()) {
                  uploader2._trigger("fileComplete", rootFile, this);
                }
              } else if (!this._progeressId) {
                triggerProgress();
              }
              break;
            case STATUS.RETRY:
              uploader2._trigger("fileRetry", rootFile, this, chunk);
              break;
          }
        },
        _updateUploadedChunks: function(message, chunk) {
          var checkChunkUploaded = this.uploader.opts.checkChunkUploadedByResponse;
          if (checkChunkUploaded) {
            var xhr = chunk.xhr;
            utils.each(this.chunks, function(_chunk) {
              if (!_chunk.tested) {
                var uploaded = checkChunkUploaded.call(this, _chunk, message);
                if (_chunk === chunk && !uploaded) {
                  _chunk.xhr = null;
                }
                if (uploaded) {
                  _chunk.xhr = xhr;
                }
                _chunk.tested = true;
              }
            }, this);
            if (!this._firstResponse) {
              this._firstResponse = true;
              this.uploader.upload(true);
            } else {
              this.uploader.uploadNextChunk();
            }
          } else {
            this.uploader.uploadNextChunk();
          }
        },
        _error: function() {
          this.error = this.allError = true;
          var parent = this.parent;
          while (parent && parent !== this.uploader) {
            parent._errorFiles.push(this);
            parent.error = true;
            if (parent._errorFiles.length === parent.files.length) {
              parent.allError = true;
            }
            parent = parent.parent;
          }
        },
        _resetError: function() {
          this.error = this.allError = false;
          var parent = this.parent;
          var index = -1;
          while (parent && parent !== this.uploader) {
            index = parent._errorFiles.indexOf(this);
            parent._errorFiles.splice(index, 1);
            parent.allError = false;
            if (!parent._errorFiles.length) {
              parent.error = false;
            }
            parent = parent.parent;
          }
        },
        isComplete: function() {
          if (!this.completed) {
            var outstanding = false;
            this._eachAccess(function(file) {
              if (!file.isComplete()) {
                outstanding = true;
                return false;
              }
            }, function() {
              if (this.error) {
                outstanding = true;
              } else {
                var STATUS = Chunk.STATUS;
                utils.each(this.chunks, function(chunk) {
                  var status = chunk.status();
                  if (status === STATUS.ERROR || status === STATUS.PENDING || status === STATUS.UPLOADING || status === STATUS.READING || chunk.preprocessState === 1 || chunk.readState === 1) {
                    outstanding = true;
                    return false;
                  }
                });
              }
            });
            this.completed = !outstanding;
          }
          return this.completed;
        },
        isUploading: function() {
          var uploading = false;
          this._eachAccess(function(file) {
            if (file.isUploading()) {
              uploading = true;
              return false;
            }
          }, function() {
            var uploadingStatus = Chunk.STATUS.UPLOADING;
            utils.each(this.chunks, function(chunk) {
              if (chunk.status() === uploadingStatus) {
                uploading = true;
                return false;
              }
            });
          });
          return uploading;
        },
        resume: function() {
          this._eachAccess(function(f) {
            f.resume();
          }, function() {
            this.paused = false;
            this.aborted = false;
            this.uploader.upload();
          });
          this.paused = false;
          this.aborted = false;
        },
        pause: function() {
          this._eachAccess(function(f) {
            f.pause();
          }, function() {
            this.paused = true;
            this.abort();
          });
          this.paused = true;
        },
        cancel: function() {
          this.uploader.removeFile(this);
        },
        retry: function(file) {
          var fileRetry = function(file2) {
            if (file2.error) {
              file2.bootstrap();
            }
          };
          if (file) {
            file.bootstrap();
          } else {
            this._eachAccess(fileRetry, function() {
              this.bootstrap();
            });
          }
          this.uploader.upload();
        },
        abort: function(reset) {
          if (this.aborted) {
            return;
          }
          this.currentSpeed = 0;
          this.averageSpeed = 0;
          this.aborted = !reset;
          var chunks = this.chunks;
          if (reset) {
            this.chunks = [];
          }
          var uploadingStatus = Chunk.STATUS.UPLOADING;
          utils.each(chunks, function(c) {
            if (c.status() === uploadingStatus) {
              c.abort();
              this.uploader.uploadNextChunk();
            }
          }, this);
        },
        progress: function() {
          var totalDone = 0;
          var totalSize = 0;
          var ret = 0;
          this._eachAccess(function(file, index) {
            totalDone += file.progress() * file.size;
            totalSize += file.size;
            if (index === this.files.length - 1) {
              ret = totalSize > 0 ? totalDone / totalSize : this.isComplete() ? 1 : 0;
            }
          }, function() {
            if (this.error) {
              ret = 1;
              return;
            }
            if (this.chunks.length === 1) {
              this._prevProgress = Math.max(this._prevProgress, this.chunks[0].progress());
              ret = this._prevProgress;
              return;
            }
            var bytesLoaded = 0;
            utils.each(this.chunks, function(c) {
              bytesLoaded += c.progress() * (c.endByte - c.startByte);
            });
            var percent = bytesLoaded / this.size;
            this._prevProgress = Math.max(this._prevProgress, percent > 0.9999 ? 1 : percent);
            ret = this._prevProgress;
          });
          return ret;
        },
        getSize: function() {
          var size = 0;
          this._eachAccess(function(file) {
            size += file.size;
          }, function() {
            size += this.size;
          });
          return size;
        },
        getFormatSize: function() {
          var size = this.getSize();
          return utils.formatSize(size);
        },
        getRoot: function() {
          if (this.isRoot) {
            return this;
          }
          var parent = this.parent;
          while (parent) {
            if (parent.parent === this.uploader) {
              return parent;
            }
            parent = parent.parent;
          }
          return this;
        },
        sizeUploaded: function() {
          var size = 0;
          this._eachAccess(function(file) {
            size += file.sizeUploaded();
          }, function() {
            utils.each(this.chunks, function(chunk) {
              size += chunk.sizeUploaded();
            });
          });
          return size;
        },
        timeRemaining: function() {
          var ret = 0;
          var sizeDelta = 0;
          var averageSpeed = 0;
          this._eachAccess(function(file, i) {
            if (!file.paused && !file.error) {
              sizeDelta += file.size - file.sizeUploaded();
              averageSpeed += file.averageSpeed;
            }
            if (i === this.files.length - 1) {
              ret = calRet(sizeDelta, averageSpeed);
            }
          }, function() {
            if (this.paused || this.error) {
              ret = 0;
              return;
            }
            var delta = this.size - this.sizeUploaded();
            ret = calRet(delta, this.averageSpeed);
          });
          return ret;
          function calRet(delta, averageSpeed2) {
            if (delta && !averageSpeed2) {
              return Number.POSITIVE_INFINITY;
            }
            if (!delta && !averageSpeed2) {
              return 0;
            }
            return Math.floor(delta / averageSpeed2);
          }
        },
        removeFile: function(file) {
          if (file.isFolder) {
            while (file.files.length) {
              var f = file.files[file.files.length - 1];
              this._removeFile(f);
            }
          }
          this._removeFile(file);
        },
        _delFilePath: function(file) {
          if (file.path && this.filePaths) {
            delete this.filePaths[file.path];
          }
          utils.each(file.fileList, function(file2) {
            this._delFilePath(file2);
          }, this);
        },
        _removeFile: function(file) {
          if (!file.isFolder) {
            utils.each(this.files, function(f, i) {
              if (f === file) {
                this.files.splice(i, 1);
                return false;
              }
            }, this);
            file.abort();
            var parent = file.parent;
            var newParent;
            while (parent && parent !== this) {
              newParent = parent.parent;
              parent._removeFile(file);
              parent = newParent;
            }
          }
          file.parent === this && utils.each(this.fileList, function(f, i) {
            if (f === file) {
              this.fileList.splice(i, 1);
              return false;
            }
          }, this);
          if (!this.isRoot && this.isFolder && !this.files.length) {
            this.parent._removeFile(this);
            this.uploader._delFilePath(this);
          }
          file.parent = null;
        },
        getType: function() {
          if (this.isFolder) {
            return "folder";
          }
          return this.file.type && this.file.type.split("/")[1];
        },
        getExtension: function() {
          if (this.isFolder) {
            return "";
          }
          return this.name.substr((~-this.name.lastIndexOf(".") >>> 0) + 2).toLowerCase();
        }
      });
      module2.exports = File;
      function parsePaths(path) {
        var ret = [];
        var paths = path.split("/");
        var len = paths.length;
        var i = 1;
        paths.splice(len - 1, 1);
        len--;
        if (paths.length) {
          while (i <= len) {
            ret.push(paths.slice(0, i++).join("/") + "/");
          }
        }
        return ret;
      }
    }, { "./chunk": 1, "./utils": 5 }], 5: [function(_dereq_, module2, exports2) {
      var oproto = Object.prototype;
      var aproto = Array.prototype;
      var serialize = oproto.toString;
      var isFunction = function(fn) {
        return serialize.call(fn) === "[object Function]";
      };
      var isArray = Array.isArray || function(ary) {
        return serialize.call(ary) === "[object Array]";
      };
      var isPlainObject = function(obj) {
        return serialize.call(obj) === "[object Object]" && Object.getPrototypeOf(obj) === oproto;
      };
      var i = 0;
      var utils = {
        uid: function() {
          return ++i;
        },
        noop: function() {
        },
        bind: function(fn, context) {
          return function() {
            return fn.apply(context, arguments);
          };
        },
        preventEvent: function(evt) {
          evt.preventDefault();
        },
        stop: function(evt) {
          evt.preventDefault();
          evt.stopPropagation();
        },
        nextTick: function(fn, context) {
          setTimeout(utils.bind(fn, context), 0);
        },
        toArray: function(ary, start, end) {
          if (start === void 0)
            start = 0;
          if (end === void 0)
            end = ary.length;
          return aproto.slice.call(ary, start, end);
        },
        isPlainObject,
        isFunction,
        isArray,
        isObject: function(obj) {
          return Object(obj) === obj;
        },
        isString: function(s) {
          return typeof s === "string";
        },
        isUndefined: function(a) {
          return typeof a === "undefined";
        },
        isDefined: function(a) {
          return typeof a !== "undefined";
        },
        each: function(ary, func, context) {
          if (utils.isDefined(ary.length)) {
            for (var i2 = 0, len = ary.length; i2 < len; i2++) {
              if (func.call(context, ary[i2], i2, ary) === false) {
                break;
              }
            }
          } else {
            for (var k in ary) {
              if (func.call(context, ary[k], k, ary) === false) {
                break;
              }
            }
          }
        },
        evalOpts: function(data, args) {
          if (utils.isFunction(data)) {
            args = utils.toArray(arguments);
            data = data.apply(null, args.slice(1));
          }
          return data;
        },
        extend: function() {
          var options;
          var name;
          var src;
          var copy;
          var copyIsArray;
          var clone;
          var target = arguments[0] || {};
          var i2 = 1;
          var length = arguments.length;
          var force = false;
          if (typeof target === "boolean") {
            force = target;
            target = arguments[1] || {};
            i2++;
          }
          if (typeof target !== "object" && !isFunction(target)) {
            target = {};
          }
          if (i2 === length) {
            target = this;
            i2--;
          }
          for (; i2 < length; i2++) {
            if ((options = arguments[i2]) != null) {
              for (name in options) {
                src = target[name];
                copy = options[name];
                if (target === copy) {
                  continue;
                }
                if (force && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
                  if (copyIsArray) {
                    copyIsArray = false;
                    clone = src && isArray(src) ? src : [];
                  } else {
                    clone = src && isPlainObject(src) ? src : {};
                  }
                  target[name] = utils.extend(force, clone, copy);
                } else if (copy !== void 0) {
                  target[name] = copy;
                }
              }
            }
          }
          return target;
        },
        formatSize: function(size) {
          if (size < 1024) {
            return size.toFixed(0) + " bytes";
          } else if (size < 1024 * 1024) {
            return (size / 1024).toFixed(0) + " KB";
          } else if (size < 1024 * 1024 * 1024) {
            return (size / 1024 / 1024).toFixed(1) + " MB";
          } else {
            return (size / 1024 / 1024 / 1024).toFixed(1) + " GB";
          }
        },
        defineNonEnumerable: function(target, key, value) {
          Object.defineProperty(target, key, {
            enumerable: false,
            configurable: true,
            writable: true,
            value
          });
        }
      };
      module2.exports = utils;
    }, {}] }, {}, [3])(3);
  });
})(uploader$1);
var Uploader$1 = uploader$1.exports;
function secondsToStr(temp) {
  const years = Math.floor(temp / 31536e3);
  if (years) {
    return years + " year" + numberEnding(years);
  }
  const days = Math.floor((temp %= 31536e3) / 86400);
  if (days) {
    return days + " day" + numberEnding(days);
  }
  const hours = Math.floor((temp %= 86400) / 3600);
  if (hours) {
    return hours + " hour" + numberEnding(hours);
  }
  const minutes = Math.floor((temp %= 3600) / 60);
  if (minutes) {
    return minutes + " minute" + numberEnding(minutes);
  }
  const seconds = temp % 60;
  return seconds + " second" + numberEnding(seconds);
  function numberEnding(number) {
    return number > 1 ? "s" : "";
  }
}
function kebabCase(s) {
  return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}
var btn_vue_vue_type_style_index_0_lang = "";
var _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const COMPONENT_NAME$6 = "uploader-btn";
const _sfc_main$6 = {
  name: COMPONENT_NAME$6,
  props: {
    directory: {
      type: Boolean,
      default: false
    },
    single: {
      type: Boolean,
      default: false
    },
    attrs: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  setup(props) {
    const btn = ref(null);
    const uploader2 = inject("uploader").proxy.uploader;
    const support = uploader2.support;
    onMounted(() => {
      nextTick(() => {
        uploader2.assignBrowse(btn.value, props.directory, props.single, props.attrs);
      });
    });
    return {
      btn,
      support
    };
  }
};
const _hoisted_1$5 = {
  class: "uploader-btn",
  ref: "btn"
};
function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
  return withDirectives((openBlock(), createElementBlock("label", _hoisted_1$5, [
    renderSlot(_ctx.$slots, "default")
  ], 512)), [
    [vShow, $setup.support]
  ]);
}
var UploaderBtn = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$6]]);
var drop_vue_vue_type_style_index_0_lang = "";
const COMPONENT_NAME$5 = "uploader-drop";
const _sfc_main$5 = {
  name: COMPONENT_NAME$5,
  setup() {
    const uploader2 = inject("uploader").proxy.uploader;
    let drop = ref(null);
    let dropClass = ref("");
    const support = uploader2.support;
    const onDragEnter = () => {
      dropClass = "uploader-dragover";
    };
    const onDragLeave = () => {
      dropClass = "";
    };
    const onDrop = () => {
      dropClass = "uploader-droped";
    };
    onMounted(() => {
      nextTick(() => {
        const dropEle = drop.value;
        uploader2.assignDrop(dropEle);
        uploader2.on("dragenter", onDragEnter);
        uploader2.on("dragleave", onDragLeave);
        uploader2.on("drop", onDrop);
      });
    });
    onBeforeUnmount(() => {
      const dropEle = drop.value;
      uploader2.off("dragenter", onDragEnter);
      uploader2.off("dragleave", onDragLeave);
      uploader2.off("drop", onDrop);
      uploader2.unAssignDrop(dropEle);
    });
    return {
      drop,
      dropClass,
      support,
      onDragEnter,
      onDragLeave,
      onDrop
    };
  }
};
function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
  return withDirectives((openBlock(), createElementBlock("div", {
    class: normalizeClass(["uploader-drop", $setup.dropClass]),
    ref: "drop"
  }, [
    renderSlot(_ctx.$slots, "default")
  ], 2)), [
    [vShow, $setup.support]
  ]);
}
var UploaderDrop = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$5]]);
const events = ["fileProgress", "fileSuccess", "fileComplete", "fileError"];
var file_vue_vue_type_style_index_0_lang = "";
const COMPONENT_NAME$4 = "uploader-file";
const _sfc_main$4 = {
  name: COMPONENT_NAME$4,
  props: {
    file: {
      type: Object,
      default() {
        return {};
      }
    },
    list: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const instance = getCurrentInstance();
    let handlers = {};
    let tid = 0;
    const response = ref(null);
    const paused = ref(false);
    const error = ref(false);
    const averageSpeed = ref(0);
    const currentSpeed = ref(0);
    const isComplete = ref(false);
    const isUploading = ref(false);
    const size = ref(0);
    const formatedSize = ref("");
    const uploadedSize = ref(0);
    const progress = ref(0);
    const timeRemaining = ref(0);
    const type = ref("");
    const extension = ref("");
    const progressingClass = ref("");
    const fileCategory = computed(() => {
      const isFolder = props.file.isFolder;
      let type2 = isFolder ? "folder" : "unknown";
      const categoryMap = props.file.uploader.opts.categoryMap;
      const typeMap = categoryMap || {
        image: ["gif", "jpg", "jpeg", "png", "bmp", "webp"],
        video: ["mp4", "m3u8", "rmvb", "avi", "swf", "3gp", "mkv", "flv"],
        audio: ["mp3", "wav", "wma", "ogg", "aac", "flac"],
        document: [
          "doc",
          "txt",
          "docx",
          "pages",
          "epub",
          "pdf",
          "numbers",
          "csv",
          "xls",
          "xlsx",
          "keynote",
          "ppt",
          "pptx"
        ]
      };
      Object.keys(typeMap).forEach((_type) => {
        const extensions = typeMap[_type];
        if (extensions.indexOf(extension.value) > -1) {
          type2 = _type;
        }
      });
      return type2;
    });
    const progressStyle = computed(() => {
      progress.value = Math.floor(props.file.progress() * 100);
      const style = `translateX(${Math.floor(progress.value - 100)}%)`;
      return {
        progress: `${progress.value}%`,
        webkitTransform: style,
        mozTransform: style,
        msTransform: style,
        transform: style
      };
    });
    const formatedAverageSpeed = computed(() => {
      return `${Uploader$1.utils.formatSize(averageSpeed.value)} / s`;
    });
    const status = computed(() => {
      let isError = error;
      if (isComplete.value) {
        return "success";
      } else if (isError.value) {
        return "error";
      } else if (isUploading.value) {
        return "uploading";
      } else if (paused.value) {
        return "paused";
      } else {
        return "waiting";
      }
    });
    const statusText = computed(() => {
      const fileStatusText = props.file.uploader.fileStatusText;
      let txt = status.value;
      if (typeof fileStatusText === "function") {
        txt = fileStatusText(status.value, response.value);
      } else {
        txt = fileStatusText[status.value];
      }
      return txt || status;
    });
    const formatedTimeRemaining = computed(() => {
      const file = props.file;
      if (timeRemaining.value === Number.POSITIVE_INFINITY || timeRemaining.value === 0) {
        return "";
      }
      let parsedTimeRemaining = secondsToStr(timeRemaining.value);
      const parseTimeRemaining = file.uploader.opts.parseTimeRemaining;
      if (parseTimeRemaining) {
        parsedTimeRemaining = parseTimeRemaining(
          timeRemaining.value,
          parsedTimeRemaining
        );
      }
      return parsedTimeRemaining;
    });
    const actionCheck = () => {
      paused.value = props.file.paused;
      error.value = props.file.error;
      isUploading.value = props.file.isUploading();
    };
    const pause = () => {
      props.file.pause();
      actionCheck();
      fileProgress();
    };
    const resume = () => {
      props.file.resume();
      actionCheck();
    };
    const remove = () => {
      props.file.cancel();
    };
    const retry = () => {
      props.file.retry();
      actionCheck();
    };
    const processResponse = (message) => {
      let res = message;
      try {
        res = JSON.parse(message);
      } catch (e) {
      }
      response.value = res;
    };
    const fileEventsHandler = (event, args) => {
      const rootFile = args[0];
      const file = args[1];
      const target = props.list ? rootFile : file;
      if (toRaw(props.file) === toRaw(target)) {
        if (props.list && event === "fileSuccess") {
          processResponse(args[2]);
          return;
        }
        instance.setupState[event](...args);
      }
    };
    const fileProgress = () => {
      progress.value = props.file.progress();
      averageSpeed.value = props.file.averageSpeed;
      currentSpeed.value = props.file.currentSpeed;
      timeRemaining.value = props.file.timeRemaining();
      uploadedSize.value = props.file.sizeUploaded();
      actionCheck();
    };
    const fileSuccess = (rootFile, file, message) => {
      if (rootFile) {
        processResponse(message);
      }
      fileProgress();
      error.value = false;
      isComplete.value = true;
      isUploading.value = false;
    };
    const fileComplete = () => {
      fileSuccess();
    };
    const fileError = (rootFile, file, message) => {
      fileProgress();
      processResponse(message);
      error.value = true;
      isComplete.value = false;
      isUploading.value = false;
    };
    watch(status, (newStatus, oldStatus) => {
      if (oldStatus && newStatus === "uploading" && oldStatus !== "uploading") {
        tid = setTimeout(() => {
          progressingClass.value = "uploader-file-progressing";
        }, 200);
      } else {
        clearTimeout(tid);
        progressingClass.value = "";
      }
    });
    onMounted(() => {
      paused.value = props.file["paused"];
      error.value = props.file["error"];
      averageSpeed.value = props.file["averageSpeed"];
      currentSpeed.value = props.file["currentSpeed"];
      isComplete.value = props.file.isComplete();
      isUploading.value = props.file.isUploading();
      size.value = props.file.getSize();
      formatedSize.value = props.file.getFormatSize();
      uploadedSize.value = props.file.sizeUploaded();
      progress.value = props.file.progress();
      timeRemaining.value = props.file.timeRemaining();
      type.value = props.file.getType();
      extension.value = props.file.getExtension();
      const eventHandler = (event) => {
        handlers[event] = (...args) => {
          fileEventsHandler(event, args);
        };
        return handlers[event];
      };
      events.forEach((event) => {
        props.file.uploader.on(event, eventHandler(event));
      });
    });
    onUnmounted(() => {
      events.forEach((event) => {
        props.file.uploader.off(event, handlers[event]);
      });
      handlers = null;
    });
    return {
      response,
      paused,
      error,
      averageSpeed,
      currentSpeed,
      isComplete,
      isUploading,
      size,
      formatedSize,
      uploadedSize,
      progress,
      timeRemaining,
      type,
      extension,
      progressingClass,
      fileCategory,
      progressStyle,
      formatedAverageSpeed,
      status,
      statusText,
      formatedTimeRemaining,
      actionCheck,
      pause,
      resume,
      remove,
      retry,
      processResponse,
      fileEventsHandler,
      fileProgress,
      fileSuccess,
      fileComplete,
      fileError
    };
  }
};
const _hoisted_1$4 = ["status"];
const _hoisted_2$2 = { class: "uploader-file-info" };
const _hoisted_3 = { class: "uploader-file-name" };
const _hoisted_4 = ["icon"];
const _hoisted_5 = { class: "uploader-file-size" };
const _hoisted_6 = /* @__PURE__ */ createElementVNode("div", { class: "uploader-file-meta" }, null, -1);
const _hoisted_7 = { class: "uploader-file-status" };
const _hoisted_8 = { class: "uploader-file-actions" };
function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", {
    class: "uploader-file",
    status: $setup.status
  }, [
    renderSlot(_ctx.$slots, "default", {
      file: $props.file,
      list: $props.list,
      status: $setup.status,
      paused: $setup.paused,
      error: $setup.error,
      response: $setup.response,
      averageSpeed: $setup.averageSpeed,
      formatedAverageSpeed: $setup.formatedAverageSpeed,
      currentSpeed: $setup.currentSpeed,
      isComplete: $setup.isComplete,
      isUploading: $setup.isUploading,
      size: $setup.size,
      formatedSize: $setup.formatedSize,
      uploadedSize: $setup.uploadedSize,
      progress: $setup.progress,
      progressStyle: $setup.progressStyle,
      progressingClass: $setup.progressingClass,
      timeRemaining: $setup.timeRemaining,
      formatedTimeRemaining: $setup.formatedTimeRemaining,
      type: $setup.type,
      extension: $setup.extension,
      fileCategory: $setup.fileCategory
    }, () => [
      createElementVNode("div", {
        class: normalizeClass(["uploader-file-progress", $setup.progressingClass]),
        style: normalizeStyle($setup.progressStyle)
      }, null, 6),
      createElementVNode("div", _hoisted_2$2, [
        createElementVNode("div", _hoisted_3, [
          createElementVNode("i", {
            class: "uploader-file-icon",
            icon: $setup.fileCategory
          }, null, 8, _hoisted_4),
          createTextVNode(toDisplayString($props.file.name), 1)
        ]),
        createElementVNode("div", _hoisted_5, toDisplayString($setup.formatedSize), 1),
        _hoisted_6,
        createElementVNode("div", _hoisted_7, [
          withDirectives(createElementVNode("span", null, toDisplayString($setup.statusText), 513), [
            [vShow, $setup.status !== "uploading"]
          ]),
          withDirectives(createElementVNode("span", null, [
            createElementVNode("span", null, toDisplayString($setup.progressStyle.progress) + "\xA0", 1),
            createElementVNode("em", null, toDisplayString($setup.formatedAverageSpeed) + "\xA0", 1),
            createElementVNode("i", null, toDisplayString($setup.formatedTimeRemaining), 1)
          ], 512), [
            [vShow, $setup.status === "uploading"]
          ])
        ]),
        createElementVNode("div", _hoisted_8, [
          createElementVNode("span", {
            class: "uploader-file-pause",
            onClick: _cache[0] || (_cache[0] = (...args) => $setup.pause && $setup.pause(...args))
          }),
          createElementVNode("span", {
            class: "uploader-file-resume",
            onClick: _cache[1] || (_cache[1] = (...args) => $setup.resume && $setup.resume(...args))
          }, "\uFE0F"),
          createElementVNode("span", {
            class: "uploader-file-retry",
            onClick: _cache[2] || (_cache[2] = (...args) => $setup.retry && $setup.retry(...args))
          }),
          createElementVNode("span", {
            class: "uploader-file-remove",
            onClick: _cache[3] || (_cache[3] = (...args) => $setup.remove && $setup.remove(...args))
          })
        ])
      ])
    ])
  ], 8, _hoisted_1$4);
}
var UploaderFile = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$4]]);
var files_vue_vue_type_style_index_0_lang = "";
const COMPONENT_NAME$3 = "uploader-files";
const _sfc_main$3 = {
  name: COMPONENT_NAME$3,
  components: {
    UploaderFile
  },
  setup() {
    const uploader2 = inject("uploader").proxy;
    return {
      files: computed(() => uploader2.files)
    };
  }
};
const _hoisted_1$3 = { class: "uploader-files" };
function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_uploader_file = resolveComponent("uploader-file");
  return openBlock(), createElementBlock("div", _hoisted_1$3, [
    renderSlot(_ctx.$slots, "default", { files: $setup.files }, () => [
      createElementVNode("ul", null, [
        (openBlock(true), createElementBlock(Fragment, null, renderList($setup.files, (file) => {
          return openBlock(), createElementBlock("li", {
            key: file.id
          }, [
            createVNode(_component_uploader_file, { file }, null, 8, ["file"])
          ]);
        }), 128))
      ])
    ])
  ]);
}
var UploaderFiles = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$3]]);
var list_vue_vue_type_style_index_0_lang = "";
const COMPONENT_NAME$2 = "uploader-list";
const _sfc_main$2 = {
  name: COMPONENT_NAME$2,
  components: {
    UploaderFile
  },
  setup() {
    const uploader2 = inject("uploader").proxy;
    return {
      fileList: computed(() => uploader2.fileList)
    };
  }
};
const _hoisted_1$2 = { class: "uploader-list" };
function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_uploader_file = resolveComponent("uploader-file");
  return openBlock(), createElementBlock("div", _hoisted_1$2, [
    renderSlot(_ctx.$slots, "default", { fileList: $setup.fileList }, () => [
      createElementVNode("ul", null, [
        (openBlock(true), createElementBlock(Fragment, null, renderList($setup.fileList, (file) => {
          return openBlock(), createElementBlock("li", {
            key: file.id
          }, [
            createVNode(_component_uploader_file, {
              file,
              list: true
            }, null, 8, ["file"])
          ]);
        }), 128))
      ])
    ])
  ]);
}
var UploaderList = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$2]]);
var unsupport_vue_vue_type_style_index_0_lang = "";
const COMPONENT_NAME$1 = "uploader-unsupport";
const _sfc_main$1 = {
  name: COMPONENT_NAME$1,
  setup() {
    const uploader2 = inject("uploader").proxy.uploader;
    const support = uploader2.support;
    return {
      support
    };
  }
};
const _hoisted_1$1 = { class: "uploader-unsupport" };
const _hoisted_2$1 = /* @__PURE__ */ createElementVNode("p", null, [
  /* @__PURE__ */ createTextVNode(" Your browser, unfortunately, is not supported by Uploader.js. The library requires support for "),
  /* @__PURE__ */ createElementVNode("a", { href: "http://www.w3.org/TR/FileAPI/" }, "the HTML5 File API"),
  /* @__PURE__ */ createTextVNode(" along with "),
  /* @__PURE__ */ createElementVNode("a", { href: "http://www.w3.org/TR/FileAPI/#normalization-of-params" }, "file slicing"),
  /* @__PURE__ */ createTextVNode(". ")
], -1);
function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return withDirectives((openBlock(), createElementBlock("div", _hoisted_1$1, [
    renderSlot(_ctx.$slots, "default", {}, () => [
      _hoisted_2$1
    ])
  ], 512)), [
    [vShow, !$setup.support]
  ]);
}
var UploaderUnsupport = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render$1]]);
var uploader_vue_vue_type_style_index_0_lang = "";
const COMPONENT_NAME = "uploader";
const FILE_ADDED_EVENT = "fileAdded";
const FILES_ADDED_EVENT = "filesAdded";
const UPLOAD_START_EVENT = "uploadStart";
const ALL_EVENTS = [
  "change",
  "dragover",
  "dragenter",
  "dragleave",
  "file-success",
  "file-complete",
  "file-progress",
  "file-added",
  "files-added",
  "files-submitted",
  "file-removed",
  "file-retry",
  "file-error",
  "upload-start",
  "complete"
];
const _sfc_main = {
  name: COMPONENT_NAME,
  props: {
    options: {
      type: Object,
      default() {
        return {};
      }
    },
    autoStart: {
      type: Boolean,
      default: true
    },
    fileStatusText: {
      type: [Object, Function],
      default() {
        return {
          success: "success",
          error: "error",
          uploading: "uploading",
          paused: "paused",
          waiting: "waiting"
        };
      }
    },
    onFileAdded: Function,
    onFilesAdded: Function
  },
  emits: ALL_EVENTS,
  setup(props, { emit }) {
    const started = ref(false);
    const files = ref([]);
    const fileList = ref([]);
    const instance = getCurrentInstance();
    let uploader2 = new Uploader$1(props.options);
    const uploadStart = () => {
      started.value = true;
    };
    const fileAdded = (file) => {
      const _file = file;
      if (props.onFileAdded) {
        const ignored = props.onFileAdded(_file);
        if (ignored === false || _file.ignored) {
          return false;
        }
      } else {
        emit(kebabCase(FILE_ADDED_EVENT), _file);
        if (_file.ignored) {
          return false;
        }
      }
    };
    const filesAdded = (files2, fileList2) => {
      if (props.onFilesAdded) {
        const ignored = props.onFilesAdded(files2, fileList2);
        if (ignored === false || files2.ignored || fileList2.ignored) {
          return false;
        }
      } else {
        emit(kebabCase(FILES_ADDED_EVENT), files2, fileList2);
        if (files2.ignored || fileList2.ignored) {
          return false;
        }
      }
    };
    const fileRemoved = () => {
      files.value = [...uploader2.files];
      fileList.value = [...uploader2.fileList];
    };
    const filesSubmitted = () => {
      files.value = [...uploader2.files];
      fileList.value = [...uploader2.fileList];
      if (props.autoStart) {
        uploader2.upload();
      }
    };
    const allEvent = (...args) => {
      const name = args[0];
      const EVENTSMAP = {
        [FILE_ADDED_EVENT]: true,
        [FILES_ADDED_EVENT]: true,
        [UPLOAD_START_EVENT]: "uploadStart"
      };
      const handler = EVENTSMAP[name];
      if (handler) {
        if (handler === true) {
          return;
        }
        instance.setupState[handler](...args.slice(1));
      }
      args[0] = kebabCase(name);
      emit(...args);
    };
    props.options.initialPaused = !props.autoStart;
    uploader2.fileStatusText = props.fileStatusText;
    uploader2.on("catchAll", allEvent);
    uploader2.on(FILE_ADDED_EVENT, fileAdded);
    uploader2.on(FILES_ADDED_EVENT, filesAdded);
    uploader2.on("fileRemoved", fileRemoved);
    uploader2.on("filesSubmitted", filesSubmitted);
    onUnmounted(() => {
      uploader2.off("catchAll", allEvent);
      uploader2.off(FILE_ADDED_EVENT, fileAdded);
      uploader2.off(FILES_ADDED_EVENT, filesAdded);
      uploader2.off("fileRemoved", fileRemoved);
      uploader2.off("filesSubmitted", filesSubmitted);
      uploader2 = null;
    });
    provide("uploader", instance);
    return {
      uploader: uploader2,
      started,
      files,
      fileList,
      uploadStart,
      fileAdded,
      filesAdded,
      fileRemoved,
      filesSubmitted,
      allEvent
    };
  },
  components: {
    UploaderBtn,
    UploaderDrop,
    UploaderUnsupport,
    UploaderList,
    UploaderFiles,
    UploaderFile
  }
};
const _hoisted_1 = { class: "uploader" };
const _hoisted_2 = /* @__PURE__ */ createElementVNode("p", null, "Drop files here to upload or", -1);
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_uploader_unsupport = resolveComponent("uploader-unsupport");
  const _component_uploader_btn = resolveComponent("uploader-btn");
  const _component_uploader_drop = resolveComponent("uploader-drop");
  const _component_uploader_list = resolveComponent("uploader-list");
  return openBlock(), createElementBlock("div", _hoisted_1, [
    renderSlot(_ctx.$slots, "default", {
      files: $setup.files,
      fileList: $setup.fileList,
      started: $setup.started
    }, () => [
      createVNode(_component_uploader_unsupport),
      createVNode(_component_uploader_drop, null, {
        default: withCtx(() => [
          _hoisted_2,
          createVNode(_component_uploader_btn, null, {
            default: withCtx(() => [
              createTextVNode("select files")
            ]),
            _: 1
          }),
          createVNode(_component_uploader_btn, { directory: true }, {
            default: withCtx(() => [
              createTextVNode("select folder")
            ]),
            _: 1
          })
        ]),
        _: 1
      }),
      createVNode(_component_uploader_list)
    ])
  ]);
}
var Uploader = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render]]);
const uploader = {
  version: "1.0.2",
  install,
  Uploader,
  UploaderBtn,
  UploaderDrop,
  UploaderUnsupport,
  UploaderList,
  UploaderFiles,
  UploaderFile
};
function install(app, options) {
  app.component(Uploader.name, Uploader);
  app.component(UploaderBtn.name, UploaderBtn);
  app.component(UploaderDrop.name, UploaderDrop);
  app.component(UploaderUnsupport.name, UploaderUnsupport);
  app.component(UploaderList.name, UploaderList);
  app.component(UploaderFiles.name, UploaderFiles);
  app.component(UploaderFile.name, UploaderFile);
}
export { uploader as default };
