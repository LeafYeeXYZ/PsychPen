library(plumber)

global_password <- "123456"

# 定义一个 API
#* @post /execute
#* @param code 需要执行的 R 代码 (字符串)
#* @param password 密码 (字符串)
#* @serializer unboxedJSON
function(req, res, code = "", password = "") {
  # 验证密码
  if (password != global_password) {
    res$status <- 401
    return(list(error = "Unauthorized"))
  }
  # 验证输入
  if (nchar(code) == 0) {
    res$status <- 400
    return(list(error = "No code provided"))
  }
  # 执行代码，捕获错误和输出
  tryCatch({
    result <- eval(parse(text = code))
    list(
      status = "success",
      result = result
    )
  }, error = function(e) {
    res$status <- 500
    list(
      status = "error",
      message = e$message
    )
  })
}
