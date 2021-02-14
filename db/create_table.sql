CREATE TABLE IF NOT EXISTS friend_code (
    user_id varchar(20)
    ,code varchar(300)
);

CREATE TABLE IF NOT EXISTS members (
    user_id varchar(20)
    ,messeage_count integer
);