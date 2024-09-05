using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using catfinder.api.orm.Entities;

namespace catfinder.api.orm.Context;

public partial class CatDBContext : DbContext
{
    public CatDBContext()
    {
    }

    public CatDBContext(DbContextOptions<CatDBContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Cat> Cats { get; set; }

    public virtual DbSet<CatAlias> CatAliases { get; set; }

    public virtual DbSet<CatPicture> CatPictures { get; set; }

    public virtual DbSet<Catboundary> Catboundaries { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Initial Catalog=catfinderGeo;Data Source=10.1.0.108;User ID=tfuser;password=$transfinder2006;Encrypt=False");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Cat>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_Cat_ID");

            entity.ToTable("Cat");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Name).HasMaxLength(50);
            entity.Property(e => e.Tags).HasMaxLength(200);
            entity.Property(e => e.Type).HasMaxLength(20);
            entity.Property(e => e.Xcoord)
                .HasColumnType("decimal(9, 6)")
                .HasColumnName("XCoord");
            entity.Property(e => e.Ycoord)
                .HasColumnType("decimal(9, 6)")
                .HasColumnName("YCoord");
        });

        modelBuilder.Entity<CatAlias>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_CatAlias_ID");

            entity.ToTable("CatAlias");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Alias).HasMaxLength(50);
            entity.Property(e => e.CatId).HasColumnName("CatID");

            entity.HasOne(d => d.Cat).WithMany(p => p.CatAliases)
                .HasForeignKey(d => d.CatId)
                .HasConstraintName("FK_Cat_ID_CatAlias_CatID");
        });

        modelBuilder.Entity<CatPicture>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_CatPicture_ID");

            entity.ToTable("CatPicture");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.CatId).HasColumnName("CatID");
            entity.Property(e => e.HashCode)
                .HasMaxLength(64)
                .IsUnicode(false);
            entity.Property(e => e.Path)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Xcoord)
                .HasColumnType("decimal(9, 6)")
                .HasColumnName("XCoord");
            entity.Property(e => e.Ycoord)
                .HasColumnType("decimal(9, 6)")
                .HasColumnName("YCoord");

            entity.HasOne(d => d.Cat).WithMany(p => p.CatPictures)
                .HasForeignKey(d => d.CatId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Cat_ID_CatPicture_CatID");
        });

        modelBuilder.Entity<Catboundary>(entity =>
        {
            entity.HasKey(e => e.Objectid).HasName("R54_pk");

            entity.ToTable("CATBOUNDARY");

            entity.Property(e => e.Objectid)
                .ValueGeneratedNever()
                .HasColumnName("OBJECTID");
            entity.Property(e => e.CatId).HasColumnName("CatID");
            entity.Property(e => e.GdbGeomattrData).HasColumnName("GDB_GEOMATTR_DATA");
        });
        modelBuilder.HasSequence("SDE_CONNECTION_ID_GENERATOR")
            .HasMax(2147483647L)
            .IsCyclic();

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
