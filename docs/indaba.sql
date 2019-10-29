# Delete tables if already existing
LOCK TABLES 
  `OSU_member` WRITE,
  `Event` WRITE,
  `Files` WRITE,
  `Slot` WRITE,
  `Invitation` WRITE,
  `Notification_Pref` WRITE,
  `Messages` WRITE,
  `Responds_To_Request` WRITE,
  `Creates_Event` WRITE,
  `Reserve_Slot` WRITE;

DROP TABLE IF EXISTS `OSU_member`;
DROP TABLE IF EXISTS `Event`;
DROP TABLE IF EXISTS `Files`;
DROP TABLE IF EXISTS `Slot`;
DROP TABLE IF EXISTS `Invitation`;
DROP TABLE IF EXISTS `Notification_Pref`;
DROP TABLE IF EXISTS `Messages`;
DROP TABLE IF EXISTS `Responds_To_Request`;
DROP TABLE IF EXISTS `Creates_Event`;
DROP TABLE IF EXISTS `Reserve_Slot`;
UNLOCK TABLES;




# Create tables
CREATE TABLE `OSU_member` (
  `onid` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `ONID_email` varchar(255) NOT NULL,
  PRIMARY KEY (`onid`)
) ENGINE = InnoDB;

CREATE TABLE `Event` (
  `event_id` int(11) NOT NULL AUTO_INCREMENT,
  `event_name` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `max_attendee_per_slot` int(11),
  `max_resv_per_attendee` int(11),
  `description` varchar(255),
  `visibility` int(11) NOT NULL,
  PRIMARY KEY (`event_id`)
) ENGINE = InnoDB;

CREATE TABLE `Slot` (
  `slot_id` int(11) NOT NULL AUTO_INCREMENT,
  `slot_date` date NOT NULL,
  `start_time` time NOT NULL,
  `duration` int(11) NOT NULL,
  `number_confirmed_resv` int(11) NOT NULL,
  `location` varchar(255) NOT NULL,
  `fk_event_id` int(11) NOT NULL,
  PRIMARY KEY (`slot_id`),
  FOREIGN KEY (`fk_event_id`) REFERENCES `Event` (`event_id`)
) ENGINE = InnoDB;

CREATE TABLE `Files` (
  `file_id` int(11) NOT NULL AUTO_INCREMENT,
  `file` blob,
  `fk_onid` varchar(255) NOT NULL,
  `fk_slot_id` int(11) NOT NULL,
  PRIMARY KEY (`file_id`),
  FOREIGN KEY (`fk_onid`) REFERENCES `OSU_member` (`onid`),
  FOREIGN KEY (`fk_slot_id`) REFERENCES `Slot` (`slot_id`)

) ENGINE = InnoDB;

CREATE TABLE `Invitation` (
  `invitation_id` int(11) NOT NULL AUTO_INCREMENT,
  `email_address` varchar(255) NOT NULL,
  `fk_event_id` int(11) NOT NULL,
  PRIMARY KEY (`invitation_id`),
  FOREIGN KEY (`fk_event_id`) REFERENCES `Event` (`event_id`)
) ENGINE = InnoDB;

CREATE TABLE `Notification_Pref` (
  `notification_id` int(11) NOT NULL AUTO_INCREMENT,
  `upcoming_resv_reminder` int(11) NOT NULL,
  `new_post_upload` int(11) NOT NULL,
  `new_time_slot` int(11) NOT NULL,
  `cancelled_resv` int(11) NOT NULL,
  `changed_resv` int(11) NOT NULL,
  `organizer` int(11) NOT NULL,
  `fk_onid` varchar(255) NOT NULL,
  PRIMARY KEY (`notification_id`),
  FOREIGN KEY (`fk_onid`) REFERENCES `OSU_member` (`onid`)
) ENGINE = InnoDB;

CREATE TABLE `Messages` (
  `message_id` int(11) NOT NULL AUTO_INCREMENT,
  `message` varchar(255),
  `fk_onid` varchar(255) NOT NULL,
  `fk_slot_id` int(11) NOT NULL,
  PRIMARY KEY (`message_id`),
  FOREIGN KEY (`fk_onid`) REFERENCES `OSU_member` (`onid`),
  FOREIGN KEY (`fk_slot_id`) REFERENCES `Slot` (`slot_id`)
) ENGINE = InnoDB;

CREATE TABLE `Responds_To_Request` (
  `fk_onid` varchar(255) NOT NULL,
  `fk_event_id` int(11) NOT NULL,
  `attending` int(11),
  PRIMARY KEY (`fk_onid`,`fk_event_id`),
  FOREIGN KEY (`fk_onid`) REFERENCES `OSU_member` (`onid`),
  FOREIGN KEY (`fk_event_id`) REFERENCES `Event` (`event_id`)
) ENGINE = InnoDB;

CREATE TABLE `Creates_Event` (
  `fk_onid` varchar(255) NOT NULL,
  `fk_event_id` int(11) NOT NULL,
  PRIMARY KEY (`fk_onid`,`fk_event_id`),
  FOREIGN KEY (`fk_onid`) REFERENCES `OSU_member` (`onid`),
  FOREIGN KEY (`fk_event_id`) REFERENCES `Event` (`event_id`) 
) ENGINE = InnoDB;

CREATE TABLE `Reserve_Slot` (
  `fk_onid` varchar(255) NOT NULL,
  `fk_slot_id` int(11) NOT NULL,
  PRIMARY KEY (`fk_onid`,`fk_slot_id`),
  FOREIGN KEY (`fk_onid`) REFERENCES `OSU_member` (`onid`),
  FOREIGN KEY (`fk_slot_id`) REFERENCES `Slot` (`slot_id`)
) ENGINE = InnoDB;


-- -- Changes:
-- Add column 'onid' to OSU_member, make primary KEY
-- delete column 'OSU_member_id' from OSU_member
-- update all foreign key references from OSU_member_id to onid
-- change all varchar from (45) to (255)
-- Fix typo in Messages table name
-- add a bunch of 'NOT NULL's