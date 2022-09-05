CREATE TABLE IF NOT EXISTS friend_code (
    user_id varchar(20) primary key
    ,code varchar(300)
);

CREATE TABLE IF NOT EXISTS members (
    user_id varchar(20) primary key
    ,message_count integer
);

CREATE TABLE IF NOT EXISTS random_matching_reactions (
    message_id varchar(20)
    ,user_id varchar(20)
);

CREATE TABLE IF NOT EXISTS random_matching_message (
    message_id varchar(20) primary key
    ,author_id varchar(20)
);

CREATE TABLE IF NOT EXISTS recruit (
    message_id varchar(20)
    ,author_id varchar(20)
    ,member_id varchar(20)
);
