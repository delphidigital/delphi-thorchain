export default function(req, res, next) {
  if(req.url === "/network") {
    res.writeHead(301, { Location: "/thorchain/chaosnet/network" });
    res.end();
  } else if(req.url === "/thorchain/network") {
    res.writeHead(301, { Location: "/thorchain/chaosnet/network" });
    res.end();
  } else if(req.url === "/thorchain") {
    res.writeHead(301, { Location: "/thorchain/chaosnet" });
    res.end();
  } else {
    next();
  }
}
