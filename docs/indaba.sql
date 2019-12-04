-- MySQL dump 10.13  Distrib 5.7.17, for macos10.12 (x86_64)
--
-- Host: indaba-1.c0ib6xevgq1s.us-east-1.rds.amazonaws.com    Database: indaba_db
-- ------------------------------------------------------
-- Server version	5.7.22-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Creates_Event`
--

DROP TABLE IF EXISTS `Creates_Event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Creates_Event` (
  `fk_onid` varchar(255) NOT NULL,
  `fk_event_id` int(11) NOT NULL,
  PRIMARY KEY (`fk_onid`,`fk_event_id`),
  KEY `Creates_Event_ibfk_2_idx` (`fk_event_id`),
  CONSTRAINT `Creates_Event_ibfk_1` FOREIGN KEY (`fk_onid`) REFERENCES `OSU_member` (`onid`),
  CONSTRAINT `Creates_Event_ibfk_2` FOREIGN KEY (`fk_event_id`) REFERENCES `Event` (`event_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Event`
--

DROP TABLE IF EXISTS `Event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Event` (
  `event_id` int(11) NOT NULL AUTO_INCREMENT,
  `event_name` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `max_attendee_per_slot` int(11) DEFAULT NULL,
  `max_resv_per_attendee` int(11) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `visibility` int(11) NOT NULL,
  `expiration_date` date DEFAULT NULL,
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB AUTO_INCREMENT=240 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Files`
--

DROP TABLE IF EXISTS `Files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Files` (
  `file_id` int(11) NOT NULL AUTO_INCREMENT,
  `file` blob,
  `fk_onid` varchar(255) NOT NULL,
  `fk_slot_id` int(11) NOT NULL,
  PRIMARY KEY (`file_id`),
  KEY `Files_ibfk_1_idx` (`fk_onid`),
  KEY `Files_ibfk_2_idx` (`fk_slot_id`),
  CONSTRAINT `Files_ibfk_1` FOREIGN KEY (`fk_onid`) REFERENCES `OSU_member` (`onid`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Files_ibfk_2` FOREIGN KEY (`fk_slot_id`) REFERENCES `Slot` (`slot_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Invitation`
--

DROP TABLE IF EXISTS `Invitation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Invitation` (
  `invitation_id` int(11) NOT NULL AUTO_INCREMENT,
  `email_address` varchar(255) NOT NULL,
  `fk_event_id` int(11) NOT NULL,
  PRIMARY KEY (`invitation_id`),
  KEY `Invitations_ibfk_1_idx` (`fk_event_id`),
  CONSTRAINT `Invitation_ibfk_1` FOREIGN KEY (`fk_event_id`) REFERENCES `Event` (`event_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=234 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Messages`
--

DROP TABLE IF EXISTS `Messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Messages` (
  `message_id` int(11) NOT NULL AUTO_INCREMENT,
  `message` varchar(255) DEFAULT NULL,
  `fk_onid` varchar(255) NOT NULL,
  `fk_slot_id` int(11) NOT NULL,
  PRIMARY KEY (`message_id`),
  KEY `Msg_ibfk_1_idx` (`fk_onid`),
  KEY `Msg_ibfk_2_idx` (`fk_slot_id`),
  CONSTRAINT `Msg_ibfk_1` FOREIGN KEY (`fk_onid`) REFERENCES `OSU_member` (`onid`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Msg_ibfk_2` FOREIGN KEY (`fk_slot_id`) REFERENCES `Slot` (`slot_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Notification_Pref`
--

DROP TABLE IF EXISTS `Notification_Pref`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  KEY `fk_onid` (`fk_onid`),
  CONSTRAINT `Notification_Pref_ibfk_1` FOREIGN KEY (`fk_onid`) REFERENCES `OSU_member` (`onid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `OSU_member`
--

DROP TABLE IF EXISTS `OSU_member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `OSU_member` (
  `onid` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `ONID_email` varchar(255) NOT NULL,
  PRIMARY KEY (`onid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Reserve_Slot`
--

DROP TABLE IF EXISTS `Reserve_Slot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Reserve_Slot` (
  `fk_onid` varchar(255) NOT NULL,
  `fk_slot_id` int(11) NOT NULL,
  PRIMARY KEY (`fk_onid`,`fk_slot_id`),
  KEY `Reserve_Slot_ibfk_2_idx` (`fk_slot_id`),
  CONSTRAINT `ResSlot_ibfk_1` FOREIGN KEY (`fk_onid`) REFERENCES `OSU_member` (`onid`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `ResSlot_ibfk_2` FOREIGN KEY (`fk_slot_id`) REFERENCES `Slot` (`slot_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Responds_To_Request`
--

DROP TABLE IF EXISTS `Responds_To_Request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Responds_To_Request` (
  `fk_onid` varchar(255) NOT NULL,
  `fk_event_id` int(11) NOT NULL,
  `attending` int(11) DEFAULT NULL,
  PRIMARY KEY (`fk_onid`,`fk_event_id`),
  KEY `fk_event_id` (`fk_event_id`),
  CONSTRAINT `Responds_To_Request_ibfk_1` FOREIGN KEY (`fk_onid`) REFERENCES `OSU_member` (`onid`),
  CONSTRAINT `Responds_To_Request_ibfk_2` FOREIGN KEY (`fk_event_id`) REFERENCES `Event` (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Slot`
--

DROP TABLE IF EXISTS `Slot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Slot` (
  `slot_id` int(11) NOT NULL AUTO_INCREMENT,
  `slot_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` varchar(45) NOT NULL,
  `duration` int(11) NOT NULL,
  `number_confirmed_resv` int(11) NOT NULL,
  `slot_location` varchar(255) NOT NULL,
  `max_attendees` int(11) NOT NULL,
  `fk_event_id` int(11) NOT NULL,
  PRIMARY KEY (`slot_id`),
  KEY `fk_event_id` (`fk_event_id`),
  CONSTRAINT `Slot_ibfk_1` FOREIGN KEY (`fk_event_id`) REFERENCES `Event` (`event_id`)
) ENGINE=InnoDB AUTO_INCREMENT=595 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-12-04 14:26:49
