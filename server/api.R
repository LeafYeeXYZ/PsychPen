library(plumber)

global_password <- "123456"

# 配置中间件来添加CORS支持
#* @filter cors
cors <- function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")  # 允许所有来源
  res$setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")  # 允许的方法
  res$setHeader("Access-Control-Allow-Headers", "Content-Type")  # 允许的请求头
  if (req$REQUEST_METHOD == "OPTIONS") {
    res$status <- 200
    return(list())
  } else {
    plumber::forward()
  }
}

# 定义一个 API
#* @post /execute
#* @param code 需要执行的 R 代码 (字符串)
#* @param password 密码 (字符串)
#* @serializer unboxedJSON
function(req, res, code = "", password = "") {
  # 验证密码
  if (password != global_password) {
    res$status <- 401
    return(list(
      status = "error",
      message = "Invalid password"
    ))
  }
  # 验证输入
  if (nchar(code) == 0) {
    res$status <- 400
    return(list(
      status = "error",
      message = "No code provided"
    ))
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
