CREATE TABLE IF NOT EXISTS friend_code (
    user_id varchar(20) primary key
    ,code varchar(300)
);

CREATE TABLE IF NOT EXISTS members (
    user_id varchar(20) primary key
    ,message_count integer
);
