const protobuf = require('protobufjs');

const world_proto = `
package world;
syntax = "proto3";
message Node {
    string id = 1;
    int32 type = 2;
    int32 rolNum = 3;
    int32 rowNum = 4;
    int32 layerNum = 5;
    int32 moldType = 6;
    int32 metaType = 7;
    int32 metaData = 8;
}

message NodeList {
    repeated Node llist = 1;
}

message GameMap {
    int32 widthNum = 1;
    int32 heightNum = 2;
    int32 levelKey = 3;
    map<string, int32> blockTypeData = 4;
    map<string, NodeList> levelData = 5;
}

message Coord {
    int32 x = 1;
    int32 y = 2;
}

message HeartBeatAckInfo {
    int64 sewrverTime = 1;
}

message WorldNodeData {
    Coord nodeCoord = 1;
    int32 province = 2;
    int32 discovery = 3;
    int32 cityId = 4;
}

message UserActiveData {
    string uid = 1;
    string icon = 2;
    int32 title = 3;
    int32 skin = 4;
    int32 friendly = 5;
    Coord curCoord = 6;
    int32 curState = 7;
    int32 areaId = 8;
    string nikeName = 9;
    int64 phone = 10;
    repeated string collectAwards = 11;
}

message UserLoginNtfInfo {
    string reConnectToken = 1;
    repeated WorldNodeData mapInfo = 2;
    UserActiveData userData = 3;
    int32 mapMaxX = 4;
    int32 mapMaxY = 5;
    repeated string collectAwards = 6;
}

message UserMoveReqInfo {
    Coord targetCoord = 1;
}

message UserMoveAckInfo {
    int32 code = 1;
    repeated WorldNodeData mapInfo = 2;
    Coord targetCoord = 3;
}

message UserShowData {
    string uid = 1;
    string icon = 2;
    int32 title = 3;
    int32 skin = 4;
    int32 friendly = 5;
    int32 areaId = 6;
    string nikeName = 7;
    int32 curState = 8;
}

message GiftData {
    int32 giftType = 1;
    int32 giftId = 2;
    Coord curCoord = 3;
    int32 giftStage = 4;
    UserShowData owner = 5;
    string giftUid = 6;
    int32 day = 7;
    int32 endTime = 8;
}

message UserOccupyGiftAckInfo {
    int32 code = 1;
    GiftData gift = 2;
}

message UserOccupyGiftReqInfo {
    string giftUId = 1;
}

message AllGiftNearByNtfInfo {
    repeated GiftData gifts = 1;
}

message NodeUserData {
    Coord nodeCoord = 1;
    int32 UserCount = 2;
    repeated UserShowData users = 3;
}

message AllUserNearByNtfInfo {
    repeated NodeUserData showData = 1;
}

message CheckInReqInfo {
    int32 posX = 1;
    int32 posY = 2;
}

message CheckInAckInfo {
    int32 code = 1;
    int64 eventId = 2;
}
`

const root = protobuf.parse(world_proto).root;
function encode(typeName, info) {
    let type = root.lookupType("world." + typeName);
    let encodedMessage = type.encode(info).finish();
    return encodedMessage;
}

function decode(typeName, buf) {
    let type = root.lookupType("world." + typeName);
    let decodedMessage = type.decode(buf);
    return decodedMessage;
}

module.exports = {
    encode,
    decode
};