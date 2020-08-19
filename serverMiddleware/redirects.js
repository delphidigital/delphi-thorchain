export default function(req, res, next) {
  if(req.url === "/network") {
    res.writeHead(301, { Location: "/thorchain/network" });
    res.end();
  } else {
    next();
  }
}
