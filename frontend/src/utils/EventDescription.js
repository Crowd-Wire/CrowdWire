export default function getEventDescription(event_type,user_id,world_id,timestamp){
    let message = "User "+ user_id;
    if(event_type == "JOIN_PLAYER"){
        message += " entered the World " ;
    }
    else if(event_type == "LEAVE_PLAYER"){
        message += " left the World ";
    }
    else if(event_type == "JOIN_CONFERENCE"){
        message += " joined a conference in the World ";
    }
    else if(event_type == "LEAVE_CONFERENCE"){
        message += " left a conference in the World ";
    }
    message += world_id; 

    message += " at " + timestamp;
    return message;
}