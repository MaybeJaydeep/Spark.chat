package com.sparkchat.repository;

import com.sparkchat.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    Page<Message> findByChatRoomIdAndIsDeletedFalseOrderBySentAtDesc(Long chatRoomId, Pageable pageable);
    
    List<Message> findByChatRoomIdAndIsDeletedFalseOrderBySentAtAsc(Long chatRoomId);
    
    @Query("SELECT m FROM Message m WHERE m.chatRoom.id = :chatRoomId AND m.isDeleted = false " +
           "AND m.sentAt > :since ORDER BY m.sentAt ASC")
    List<Message> findRecentMessages(@Param("chatRoomId") Long chatRoomId, @Param("since") LocalDateTime since);
    
    @Query("SELECT m FROM Message m WHERE m.expiresAt IS NOT NULL AND m.expiresAt <= :now AND m.isDeleted = false")
    List<Message> findExpiredMessages(@Param("now") LocalDateTime now);
    
    @Modifying
    @Query("UPDATE Message m SET m.isDeleted = true WHERE m.id IN :messageIds")
    void markMessagesAsDeleted(@Param("messageIds") List<Long> messageIds);
    
    @Query("SELECT COUNT(m) FROM Message m WHERE m.chatRoom.id = :chatRoomId AND m.isDeleted = false")
    Long countByChatRoomId(@Param("chatRoomId") Long chatRoomId);
    
    @Query("SELECT m FROM Message m WHERE m.sender.id = :senderId AND m.isDeleted = false ORDER BY m.sentAt DESC")
    List<Message> findBySenderId(@Param("senderId") Long senderId);
}