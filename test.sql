create table test1.trx (
sym         char(3)       NOT NULL, -- Three digit code for the currency of the transaction
action      varchar(32)   NOT NULL, -- The transaction item action type
amt         decimal(12,4) NOT NULL, -- Float of the amount of the transaction
cuid0       varchar(32)   NOT NULL, -- id of the first user involved in a transaction
cuid1       varchar(32),   -- (optional) id of the second user involved in a transaction (if applicable)
actor       varchar(32),   -- (optional) id of the actor of the transaction (in the example of a transaction with action type ‘cancel’, who canceled)
source      varchar(32),   -- (optional) the source wallet involved in the transaction
destination varchar(32),   -- (optional) the destination wallet involved in the transaction
note        varchar(128),  -- (optional) an optional string added to many transaction type (like a comment on a payment, or the destination of a card swipe)
tuid        varchar(32)   NOT NULL, -- internal transaction id that links a transaction chain
external_id varchar(32),   -- (optional) id used for accounting when interacting with an external service
"timestamp" bigint        NOT NULL, -- millisecond utc timestamp of the transaction
ref_tuid    varchar(32)    -- (optional) a tuid that this transaction references (for example an init_deposit that references a ‘recurring_deposit’)
);

CREATE INDEX timestamp_index   ON test1.trx ("timestamp");
CREATE INDEX tuid_index        ON test1.trx (tuid);
CREATE INDEX ref_tuid_index    ON test1.trx (ref_tuid);
CREATE INDEX source_index      ON test1.trx (source);
CREATE INDEX destination_index ON test1.trx (destination);

--\copy test1.trx (sym, action, amt, cuid0, cuid1, actor, source, destination, note, tuid, external_id, "timestamp",ref_tuid) FROM '/Users/kirlen/dev/misc/pg-test1/trx_subset.csv' CSV HEADER;
-- bad lines: 337,2857-8, 3397, 39, etc.

select timestamp,tuid,ref_tuid,action from test1.trx where tuid = 'S9RZ-S28A' or ref_tuid = 'S9RZ-S28A' order by timestamp
select timestamp,action,sym,amt,cuid0,cuid1,actor,source,destination,note,tuid,external_id,ref_tuid from test1.trx where tuid = 'S9RZ-S28A' or ref_tuid = 'S9RZ-S28A' order by timestamp asc
select timestamp,action,sym,amt,cuid0,cuid1,actor,source,destination,note,tuid,external_id,ref_tuid from test1.trx where source = 'S9RZ-S28A' or destination = 'S9RZ-S28A' order by timestamp asc